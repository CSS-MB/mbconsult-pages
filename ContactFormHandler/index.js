const nodemailer = require("nodemailer");
const validator = require("validator"); // Import validator for isIP usage

// Central CORS header set so we don't repeat strings.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin":
    process.env.CORS_ORIGIN || "https://mbconsult.io", // Use env var or fallback to default.
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400",
};

// Basic email pattern (not exhaustive but adequate server-side guard).
// Use validator.isEmail directly for email validation.

// Helper: build response
function buildResponse(status, bodyObj) {
  return {
    status,
    headers: {
      "Content-Type": "application/json",
      ...CORS_HEADERS,
    },
    body: JSON.stringify(bodyObj),
  };
}

module.exports = async function (context, req) {
  try {
    // Handle CORS preflight (OPTIONS) requests.
    // 204 No Content is used instead of 200 to indicate a successful request with no response body,
    // which is the correct response for CORS preflight requests.
    if (req.method === "OPTIONS") {
      context.res = {
        status: 204,
        headers: {
          ...CORS_HEADERS,
        },
      };
      return;
    }

    if (req.method !== "POST") {
      context.res = buildResponse(405, { error: "Method Not Allowed" });
      return;
    }

    const { name, email, message, company } =
      typeof req.body === "object" && req.body !== null ? req.body : {};

    // Honeypot check (anti-spam) - if company field is filled, silently reject
    if (company && typeof company === "string" && company.trim() !== "") {
      // Return success to bots to avoid fueling retries, but don't send email
      context.res = buildResponse(200, {
        success: true,
        message: "Email sent successfully.",
      });
      return;
    }

    const errors = [];
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      errors.push("Invalid name.");
    }
    if (!email || typeof email !== "string" || !validator.isEmail(email)) {
      errors.push("Invalid email.");
    }
    if (!message || typeof message !== "string" || message.trim().length < 5) {
      errors.push("Invalid message.");
    }

    if (errors.length) {
      context.res = buildResponse(400, { success: false, errors });
      return;
    }

    // Ensure OFFICE365_USER and CONTACTFORM_RECIPIENT are set
    if (!process.env.OFFICE365_USER) {
      context.res = buildResponse(500, {
        success: false,
        error: "Email sender is not configured.",
      });
      return;
    }
    if (!process.env.CONTACTFORM_RECIPIENT) {
      context.res = buildResponse(500, {
        success: false,
        error: "Recipient email is not configured.",
      });
      return;
    }

    // Ensure OFFICE365_PASS is set
    if (!process.env.OFFICE365_PASS) {
      context.res = buildResponse(500, {
        success: false,
        error: "Email password is not configured.",
      });
      return;
    }

    // SMTP configuration - uses environment variables for secrets
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.OFFICE365_USER,
        pass: process.env.OFFICE365_PASS,
      },
    });

    // Extract IP address if available (Azure Functions: req.headers["x-forwarded-for"] or req.ip)
    function getValidIp(ip) {
      // Use validator's isIP for strict IPv4/IPv6 validation
      return ip && validator.isIP(ip) ? ip : "Unknown";
    }
    let rawIp = "Unknown";
    if (
      req.headers &&
      typeof req.headers["x-forwarded-for"] === "string" &&
      req.headers["x-forwarded-for"].trim() !== ""
    ) {
      rawIp = req.headers["x-forwarded-for"].split(",")[0].trim();
    } else if (req.ip && typeof req.ip === "string" && req.ip.trim() !== "") {
      rawIp = req.ip;
    } else {
      context.log.warn(
        "Unable to determine client IP: missing x-forwarded-for and req.ip"
      );
    }
    const userIp = getValidIp(rawIp);
    const userAgent = (req.headers && req.headers["user-agent"]) || "Unknown";

    // Prepare mail options
    // Note: The 'name' field is validated above to prevent header injection.
    // As an extra precaution, strip CR/LF characters from 'name' to prevent header injection if validation is bypassed.
    const safeName = name.replace(/[\r\n]+/g, " ").trim();
    const mailOptions = {
      from: process.env.OFFICE365_USER,
      to: process.env.CONTACTFORM_RECIPIENT,
      subject: "New Contact Form Submission",
      text: [
        `Name: ${safeName}`,
        `Email: ${email}`,
        `IP: ${userIp}`,
        `User-Agent: ${userAgent}`,
        `Message:`,
        message,
      ].join("\n"),
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      context.log.error(
        `Failed to send email to ${mailOptions.to} with subject "${mailOptions.subject}":`,
        mailErr
      );
      // Wrap the original error for better diagnostics
      const customError = new Error(
        `ContactFormHandler: Failed to send email. Original error: ${mailErr.message}`
      );
      customError.originalError = mailErr;
      throw customError; // Rethrow to be handled by the outer catch
    }

    context.res = buildResponse(200, {
      success: true,
      message: "Email sent successfully.",
    });
    // Catch-all for unexpected errors: logs for diagnostics and returns generic failure.
  } catch (err) {
    context.log.error(
      `ContactFormHandler error: method=${req.method}, ip=${
        (req.headers && req.headers["x-forwarded-for"]) || req.ip || "Unknown"
      }, userAgent=${(req.headers && req.headers["user-agent"]) || "Unknown"}`,
      err
    );
    context.res = buildResponse(500, {
      success: false,
      error: "Failed to send email.",
    });
  }
};

