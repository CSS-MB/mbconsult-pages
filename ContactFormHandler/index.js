// ContactFormHandler/index.js
const nodemailer = require("nodemailer");
const validator = require("validator");

// STRICT CORS enforcement - only production domains allowed
const DEFAULT_ORIGINS = ["https://mbconsult.io", "https://www.mbconsult.io"];
const ALLOWLIST = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = ALLOWLIST.length ? ALLOWLIST : DEFAULT_ORIGINS;

// Log module load so platform indexing/state can be confirmed in live logs
console.log(
  "[ContactFormHandler] Module loaded",
  new Date().toISOString(),
  "Allowed origins:",
  ALLOWED_ORIGINS.join(",") || "(none)"
);

// Enhanced validation constants
const MIN_TIMING_MS = 300; // Minimum time since form load to prevent bot submissions

const MAX_JSON_BYTES = 1024 * 32;
const MAX_MESSAGE_LENGTH = parseInt(
  process.env.MAX_MESSAGE_LENGTH || "4000",
  10
);
const MIN_MESSAGE_LENGTH = parseInt(process.env.MIN_MESSAGE_LENGTH || "10", 10);
const MAX_NAME_LENGTH = parseInt(process.env.MAX_NAME_LENGTH || "200", 10);
const RATE_LIMIT_SECONDS = parseInt(process.env.RATE_LIMIT_SECONDS || "60", 10);
const DRY_RUN = String(process.env.DRY_RUN || "false").toLowerCase() === "true";

const ipCooldown = new Map();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const corsHeaders = (req) => {
  const origin = req.headers.origin;

  // STRICT CORS: Only allow explicitly configured origins
  if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": "null",
      Vary: "Origin",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Max-Age": "86400",
    };
  }

  return {
    "Access-Control-Allow-Origin": origin,
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
  };
};
const jsonRes = (status, body, req) => ({
  status,
  headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  body: JSON.stringify(body),
});

const getIp = (req) => req.headers["x-forwarded-for"] || req.ip || "unknown";
const nowSec = () => Math.floor(Date.now() / 1000);
const isRateLimited = (ip) => (ipCooldown.get(ip) || 0) > nowSec();
const coolDown = (ip) => ipCooldown.set(ip, nowSec() + RATE_LIMIT_SECONDS);

const parseBody = (req) => {
  if (typeof req.body === "object" && req.body) return req.body;
  if (typeof req.body === "string") {
    if (req.body.length > MAX_JSON_BYTES) return null;
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
};
const sanitize = (s, max) => (typeof s === "string" ? s.trim().slice(0, max) : "");
const escapeHtml = (s) =>
  String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function validate(payload) {
  const errs = [];
  const name = sanitize(payload.name, MAX_NAME_LENGTH);
  const email = sanitize(payload.email, 320);
  const message = sanitize(payload.message, MAX_MESSAGE_LENGTH);
  const company = sanitize(payload.company, 256); // honeypot
  const timing = parseInt(payload.timing || "0", 10); // client timing validation

  if (!name) errs.push("name is required");
  else if (name.length < 2) errs.push("name must be at least 2 characters");

  if (!email || !validator.isEmail(email)) errs.push("valid email is required");

  if (!message || message.length < MIN_MESSAGE_LENGTH)
    errs.push(`message must be at least ${MIN_MESSAGE_LENGTH} characters`);

  if (timing > 0 && timing < MIN_TIMING_MS) {
    return { name, email, message, company, errs, timingFail: true };
  }

  return { name, email, message, company, errs, timingFail: false };
}

function getTransport() {
  const host = process.env.SMTP_HOST || "smtp.office365.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure =
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.OFFICE365_USER || process.env.SMTP_USER;
  const pass = process.env.OFFICE365_PASS || process.env.SMTP_PASS;
  if (!user || !pass)
    throw new Error("Missing SMTP creds (OFFICE365_USER/OFFICE365_PASS)");
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { minVersion: "TLSv1.2" },
  });
}

module.exports = async function (context, req) {
  const startTime = Date.now();
  
  try {
    if ((req.method || "").toUpperCase() === "OPTIONS") {
      context.res = { status: 204, headers: corsHeaders(req), body: "" };
      return;
    }

    // CORS validation first
    const origin = req.headers.origin;
    if (!origin || !ALLOWED_ORIGINS.includes(origin)) {
      context.log.warn(`CORS violation from origin: ${origin || "null"}`);
      context.res = jsonRes(
        403,
        { success: false, error: "Access denied" },
        req
      );
      return;
    }

    const ct = (req.headers["content-type"] || "").toLowerCase();
    if (!ct.includes("application/json")) {
      context.log.warn(`Invalid content-type: ${ct}`);
      context.res = jsonRes(
        415,
        { success: false, error: "Content-Type must be application/json" },
        req
      );
      return;
    }

    const ip = getIp(req);
    if (isRateLimited(ip)) {
      context.log.warn(`Rate limit exceeded for IP: ${ip}`);
      context.res = jsonRes(
        429,
        { success: false, error: "Too many requests" },
        req
      );
      return;
    }

    const payload = parseBody(req);
    if (!payload) {
      context.log.warn(`Invalid JSON body from IP: ${ip}`);
      context.res = jsonRes(
        400,
        { success: false, error: "Invalid or missing JSON body" },
        req
      );
      return;
    }
    
    const { name, email, message, company, errs, timingFail } = validate(payload);
    
    // Honeypot check - log but respond with success
    if (company) {
      context.log.warn(`Honeypot triggered: IP=${ip}, company="${company}"`);
      await sleep(700);
      context.res = jsonRes(200, { success: true, honeypot: true }, req);
      return;
    }
    
    // Timing validation - log but respond with success  
    if (timingFail) {
      context.log.warn(`Timing validation failed: IP=${ip}, timing=${payload.timing}ms`);
      await sleep(700);
      context.res = jsonRes(200, { success: true, timing: true }, req);
      return;
    }
    
    if (errs.length) {
      context.log.warn(`Validation errors: IP=${ip}, errors=${errs.join(", ")}`);
      context.res = jsonRes(400, { success: false, errors: errs }, req);
      return;
    }

    const to = process.env.TO_EMAIL;
    const from = process.env.FROM_EMAIL || process.env.OFFICE365_USER;
    if (!to || !from) {
      context.log.error(`Missing email configuration: TO_EMAIL=${!!to}, FROM_EMAIL=${!!from}`);
      context.res = jsonRes(
        500,
        {
          success: false,
          error: "Server misconfiguration (TO_EMAIL/FROM_EMAIL)",
        },
        req
      );
      return;
    }

    if (DRY_RUN) {
      context.log.info(`DRY_RUN: Contact form submission from ${name} <${email}> (IP: ${ip})`);
      context.res = jsonRes(200, { success: true, dryRun: true }, req);
      return;
    }

    const subject = `${
      process.env.SUBJECT_PREFIX || "[MB CONSULT Contact]"
    } ${name} <${email}>`;
    const text = `New contact form submission

Name: ${name}
Email: ${email}
IP: ${ip}
Processing Time: ${Date.now() - startTime}ms

Message:
${message}
`;
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;line-height:1.4">
        <h3 style="margin:0 0 8px">New contact form submission</h3>
        <table style="border-collapse:collapse;margin-bottom:12px">
          <tr>
            <td style="padding:2px 6px;color:#666">Name</td>
            <td style="padding:2px 6px">${escapeHtml(name)}</td>
          </tr>
          <tr>
            <td style="padding:2px 6px;color:#666">Email</td>
            <td style="padding:2px 6px">${escapeHtml(email)}</td>
          </tr>
          <tr>
            <td style="padding:2px 6px;color:#666">IP</td>
            <td style="padding:2px 6px">${escapeHtml(ip)}</td>
          </tr>
          <tr>
            <td style="padding:2px 6px;color:#666">Processing Time</td>
            <td style="padding:2px 6px">${Date.now() - startTime}ms</td>
          </tr>
        </table>
        <div style="white-space:pre-wrap;border:1px solid #eee;padding:8px;border-radius:6px;background:#fafafa">
          ${escapeHtml(message)}
        </div>
      </div>
    `;

    const mail = {
      from,
      sender: process.env.OFFICE365_USER,
      to,
      subject,
      text,
      html,
      envelope: { from, to },
      headers: { "X-Sender": process.env.OFFICE365_USER },
    };

    await getTransport().sendMail(mail);
    coolDown(ip);
    
    context.log.info(`Email sent successfully: ${name} <${email}> (IP: ${ip})`);
    context.res = jsonRes(200, { success: true }, req);
    
  } catch (e) {
    const msg = String(e && (e.message || e));
    const low = msg.toLowerCase();
    let hint = "send-failed";
    if (low.includes("invalid login") || low.includes("authentication"))
      hint = "smtp-auth";
    if (
      low.includes("not authorized") ||
      low.includes("sender") ||
      low.includes("from address")
    )
      hint = "send-as";
    
    context.log.error("ContactFormHandler error:", {
      message: msg,
      ip: getIp(req),
      origin: req.headers.origin,
      userAgent: req.headers["user-agent"],
    });
    
    context.res = jsonRes(
      500,
      { success: false, error: "Failed to send email.", hint },
      req
    );
  }
};
