const nodemailer = require("nodemailer");

// Central CORS header set so we don't repeat strings.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://mbconsult.io", // Use specific domain; switch to "*" only if you must.
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400"
};

// Basic email pattern (not exhaustive but adequate server-side guard).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Helper: build response
function buildResponse(status, bodyObj) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS
    },
    body: JSON.stringify(bodyObj)
  };
}

module.exports = async function (context, req) {
  try {
    // Handle preflight
    if (req.method === "OPTIONS") {
      context.res = {
        status: 204,
        headers: {
          ...CORS_HEADERS
        }
      };
      return;
    }

    if (req.method !== "POST") {
      context.res = buildResponse(405, { error: "Method Not Allowed" });
      return;
    }

    const { name, email, message } = req.body || {};

    // Server-side validation (never trust client)
    const errors = [];
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.push("Invalid name.");
    }
    if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      errors.push("Invalid email.");
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      errors.push("Invalid message.");
    }

    if (errors.length) {
      context.res = buildResponse(400, { success: false, errors });
      return;
    }

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.OFFICE365_USER,
        pass: process.env.OFFICE365_PASS
      }
    });

    const mailOptions = {
      from: process.env.OFFICE365_USER,
      to: "mathew@mbconsult.io",
      subject: `Contact Form Submission from ${name}`,
      text: [
        `Name: ${name}`,
        `Email: ${email}`,
        `Message:`,
        message
      ].join("\n")
    };

    await transporter.sendMail(mailOptions);

    context.res = buildResponse(200, { success: true, message: "Email sent successfully." });
  } catch (err) {
    context.log.error("ContactFormHandler error:", err);
    context.res = buildResponse(500, { success: false, error: "Failed to send email." });
  }
};