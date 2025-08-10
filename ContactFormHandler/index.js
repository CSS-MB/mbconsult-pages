/**
 * MB CONSULT — ContactFormHandler
 * Azure Functions v4 (Node 20, Linux)
 *
 * Features:
 *   - CORS (OPTIONS preflight + response headers), origin allowlist
 *   - JSON-only POST; size cap; strict schema validation
 *   - Honeypot field ("company") → silent success (no email) to waste bot cycles
 *   - Rate-limit guard (simple per-IP cooldown in-memory best-effort)
 *   - Office 365 SMTP via Nodemailer (TLS 587), optional DKIM
 *   - Clear, structured JSON responses and detailed server logs
 *
 * Required App Settings:
 *   - TO_EMAIL                (recipient email)
 *   - FROM_EMAIL              (envelope/from)
 *   - OFFICE365_USER          (SMTP user; typically same as FROM_EMAIL)
 *   - OFFICE365_PASS          (SMTP password)
 *
 * Optional App Settings:
 *   - CORS_ORIGINS            (comma-separated allowlist; e.g. "https://mbconsult.io,https://www.mbconsult.io")
 *   - SUBJECT_PREFIX          (e.g., "[MB CONSULT Contact]")
 *   - SMTP_HOST               (default smtp.office365.com)
 *   - SMTP_PORT               (default 587)
 *   - SMTP_SECURE             ("true" to force SMTPS; default false)
 *   - DKIM_DOMAIN, DKIM_SELECTOR, DKIM_PRIVATE_KEY (PEM)  // optional
 *   - MIN_MESSAGE_LENGTH      (default 10)
 *   - MAX_MESSAGE_LENGTH      (default 4000)
 *   - MAX_NAME_LENGTH         (default 200)
 *   - RATE_LIMIT_SECONDS      (default 60)
 */

const nodemailer = require("nodemailer");
const validator = require("validator");

// -----------------------------
// CORS
// -----------------------------
const DEFAULT_ORIGINS = ["https://mbconsult.io", "https://www.mbconsult.io"];
const ALLOWLIST = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const ALLOWED_ORIGINS = ALLOWLIST.length ? ALLOWLIST : DEFAULT_ORIGINS;

function pickCorsOrigin(req) {
  const origin =
    (req.headers && (req.headers.origin || req.headers.Origin)) || "";
  if (!origin) return ALLOWED_ORIGINS[0];
  return ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
}

function corsHeaders(req) {
  return {
    "Access-Control-Allow-Origin": pickCorsOrigin(req),
    Vary: "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400",
  };
}

function buildResponse(status, bodyObj, req) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(req),
    },
    body: JSON.stringify(bodyObj),
  };
}

// -----------------------------
// Limits & Validation
// -----------------------------
const MAX_MESSAGE_LENGTH = parseInt(
  process.env.MAX_MESSAGE_LENGTH || "4000",
  10
);
const MIN_MESSAGE_LENGTH = parseInt(process.env.MIN_MESSAGE_LENGTH || "10", 10);
const MAX_NAME_LENGTH = parseInt(process.env.MAX_NAME_LENGTH || "200", 10);
const MAX_JSON_BYTES = 1024 * 32; // 32KB JSON limit (defense-in-depth)

function getClientIp(req) {
  return (
    (req.headers &&
      (req.headers["x-forwarded-for"] || req.headers["X-Forwarded-For"])) ||
    req.ip ||
    req.headers?.["x-appservice-proto"] ||
    "unknown"
  );
}

function parseBody(req) {
  if (!req || typeof req.body === "undefined" || req.body === null) return null;
  if (typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    if (req.body.length > MAX_JSON_BYTES) return null;
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  return null;
}

function sanitizeString(s, max) {
  if (!s || typeof s !== "string") return "";
  const trimmed = s.trim();
  return trimmed.slice(0, max);
}

function validatePayload(payload) {
  const errors = [];

  const name = sanitizeString(payload.name, MAX_NAME_LENGTH);
  const email = sanitizeString(payload.email, 320);
  const message = sanitizeString(payload.message, MAX_MESSAGE_LENGTH);
  const company = sanitizeString(payload.company, 256); // honeypot: if present → bot

  if (!name) errors.push("name is required");
  if (!email || !validator.isEmail(email))
    errors.push("valid email is required");
  if (!message || message.length < MIN_MESSAGE_LENGTH)
    errors.push(`message must be at least ${MIN_MESSAGE_LENGTH} characters`);
  if (company) errors.push("honeypot hit"); // will be treated as bot (we'll fake success)

  return { name, email, message, company, errors };
}

// -----------------------------
// Rate-limit (best-effort)
// -----------------------------
const RATE_LIMIT_SECONDS = parseInt(process.env.RATE_LIMIT_SECONDS || "60", 10);
const ipCooldown = new Map(); // { ip -> epochSeconds }

function isRateLimited(ip) {
  if (!ip || ip === "unknown") return false;
  const now = Math.floor(Date.now() / 1000);
  const until = ipCooldown.get(ip) || 0;
  return until > now;
}
function setCooldown(ip) {
  if (!ip || ip === "unknown") return;
  const now = Math.floor(Date.now() / 1000);
  ipCooldown.set(ip, now + RATE_LIMIT_SECONDS);
}

// -----------------------------
// Mail Transport (Office 365 by default)
// -----------------------------
function buildTransport() {
  const host = process.env.SMTP_HOST || "smtp.office365.com";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure =
    String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.OFFICE365_USER || process.env.SMTP_USER;
  const pass = process.env.OFFICE365_PASS || process.env.SMTP_PASS;

  if (!user || !pass)
    throw new Error(
      "SMTP credentials missing: set OFFICE365_USER and OFFICE365_PASS"
    );

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { ciphers: "TLSv1.2", minVersion: "TLSv1.2" },
  });

  // Optional DKIM
  const dkimDomain = process.env.DKIM_DOMAIN;
  const dkimSelector = process.env.DKIM_SELECTOR;
  const dkimKey = process.env.DKIM_PRIVATE_KEY;
  if (dkimDomain && dkimSelector && dkimKey) {
    transporter.use("stream", (mail, done) => {
      mail.message.options.dkim = {
        domainName: dkimDomain,
        keySelector: dkimSelector,
        privateKey: dkimKey,
      };
      done();
    });
  }

  return transporter;
}

async function sendMail({ from, to, subject, text, html }) {
  const transporter = buildTransport();
  return transporter.sendMail({ from, to, subject, text, html });
}

// -----------------------------
// Handler
// -----------------------------
module.exports = async function (context, req) {
  try {
    // OPTIONS → preflight
    if ((req.method || "").toUpperCase() === "OPTIONS") {
      context.log.info("CORS preflight");
      context.res = {
        status: 204,
        headers: corsHeaders(req),
        body: "",
      };
      return;
    }

    // Content-Type guard
    const ct =
      (req.headers &&
        (req.headers["content-type"] || req.headers["Content-Type"])) ||
      "";
    if (!ct.toLowerCase().includes("application/json")) {
      context.res = buildResponse(
        415,
        { success: false, error: "Content-Type must be application/json" },
        req
      );
      return;
    }

    // Parse & validate
    const ip = getClientIp(req);
    if (isRateLimited(ip)) {
      context.log.warn(`Rate-limited IP: ${ip}`);
      context.res = buildResponse(
        429,
        { success: false, error: "Too many requests, slow down." },
        req
      );
      return;
    }

    const payload = parseBody(req);
    if (!payload) {
      context.res = buildResponse(
        400,
        { success: false, error: "Invalid or missing JSON body" },
        req
      );
      return;
    }

    const { name, email, message, company, errors } = validatePayload(payload);

    // Honeypot: silently succeed to fool bots (do NOT email)
    if (company) {
      context.log.warn(`Honeypot hit from IP ${ip}; company='${company}'`);
      // Deliberate small delay to waste bot time
      await new Promise((r) => setTimeout(r, 700));
      context.res = buildResponse(200, { success: true }, req);
      return;
    }

    if (errors.length) {
      context.res = buildResponse(400, { success: false, errors }, req);
      return;
    }

    // Build mail content
    const to = process.env.TO_EMAIL;
    const from = process.env.FROM_EMAIL || process.env.OFFICE365_USER;
    if (!to || !from) {
      context.log.error("Missing TO_EMAIL or FROM_EMAIL settings");
      context.res = buildResponse(
        500,
        { success: false, error: "Server misconfiguration" },
        req
      );
      return;
    }

    const subjectPrefix = process.env.SUBJECT_PREFIX || "[MB CONSULT Contact]";
    const subject = `${subjectPrefix} ${name} <${email}>`;
    const plain = [
      `New contact form submission`,
      ``,
      `Name:    ${name}`,
      `Email:   ${email}`,
      `IP:      ${ip}`,
      ``,
      `Message:`,
      message,
    ].join("\n");

    const safeHtml = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;line-height:1.4">
        <h3 style="margin:0 0 8px">New contact form submission</h3>
        <table style="border-collapse:collapse;margin-bottom:12px">
          <tr><td style="padding:2px 6px;color:#666">Name</td><td style="padding:2px 6px">${escapeHtml(
            name
          )}</td></tr>
          <tr><td style="padding:2px 6px;color:#666">Email</td><td style="padding:2px 6px">${escapeHtml(
            email
          )}</td></tr>
          <tr><td style="padding:2px 6px;color:#666">IP</td><td style="padding:2px 6px">${escapeHtml(
            ip
          )}</td></tr>
        </table>
        <div style="white-space:pre-wrap;border:1px solid #eee;padding:8px;border-radius:6px;background:#fafafa">${escapeHtml(
          message
        )}</div>
      </div>
    `;

    // Send
    const info = await sendMail({
      from,
      to,
      subject,
      text: plain,
      html: safeHtml,
    });

    context.log.info(
      `Mail sent: messageId=${info.messageId || "n/a"} to=${to}`
    );
    setCooldown(ip);
    context.res = buildResponse(200, { success: true }, req);
  } catch (err) {
    context.log.error(
      `ContactFormHandler error: method=${req.method}, ip=${getClientIp(req)}`,
      err && (err.stack || err.message || err)
    );
    context.res = buildResponse(
      500,
      { success: false, error: "Failed to send email." },
      req
    );
  }
};

// -----------------------------
// Helpers
// -----------------------------
function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
