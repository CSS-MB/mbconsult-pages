const nodemailer = require("nodemailer");

// CORS configuration
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://mbconsult.io", // Add staging domains as needed: ["https://mbconsult.io", "https://staging.mbconsult.io"]
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
  "Access-Control-Max-Age": "86400"
};

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Input size limits (to prevent abuse)
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 5000;

module.exports = async function (context, req) {
  // Add CORS headers to all responses
  context.res = context.res || {};
  context.res.headers = { ...CORS_HEADERS };

  try {
    // Handle OPTIONS preflight request
    if (req.method === "OPTIONS") {
      context.res.status = 204;
      context.res.body = null;
      return;
    }

    // Only allow POST for actual form submission
    if (req.method !== "POST") {
      context.res.status = 405;
      context.res.body = {
        success: false,
        error: "Method not allowed"
      };
      return;
    }

    // Parse and validate input
    const { name, email, message, company } = req.body || {};

    // Basic input validation
    const errors = [];

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.push("Name is required");
    } else if (name.length > MAX_NAME_LENGTH) {
      errors.push(`Name must be ${MAX_NAME_LENGTH} characters or less`);
    }

    if (!email || typeof email !== "string" || email.trim().length === 0) {
      errors.push("Email is required");
    } else if (email.length > MAX_EMAIL_LENGTH) {
      errors.push(`Email must be ${MAX_EMAIL_LENGTH} characters or less`);
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.push("Please enter a valid email address");
    }

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      errors.push("Message is required");
    } else if (message.length > MAX_MESSAGE_LENGTH) {
      errors.push(`Message must be ${MAX_MESSAGE_LENGTH} characters or less`);
    }

    // Return validation errors
    if (errors.length > 0) {
      context.res.status = 400;
      context.res.body = {
        success: false,
        message: "Please fix the following errors:",
        errors: errors
      };
      return;
    }

    // Honeypot check - if company field is filled, it's spam
    if (company && typeof company === "string" && company.trim().length > 0) {
      context.log.warn("Honeypot triggered for email:", email);
      // Return fake success to avoid training bots
      context.res.status = 200;
      context.res.body = {
        success: true,
        message: "Message sent successfully"
      };
      return;
    }

    // Sanitize inputs (basic newline normalization)
    const sanitizedName = name.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const sanitizedEmail = email.trim();
    const sanitizedMessage = message.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.OFFICE365_USER,
        pass: process.env.OFFICE365_PASS,
      },
    });

    // Email configuration
    const mailOptions = {
      from: process.env.OFFICE365_USER,
      to: "mathew@mbconsult.io",
      subject: `Contact Form Submission from ${sanitizedName}`,
      text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\nMessage: ${sanitizedMessage}`,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Log successful submission (without sensitive data)
    context.log("Contact form submitted successfully for:", sanitizedEmail);

    // Return success response
    context.res.status = 200;
    context.res.body = {
      success: true,
      message: "Message sent successfully"
    };

  } catch (error) {
    // Log error for debugging
    context.log.error("Contact form submission error:", error);

    // Return generic error to user
    context.res.status = 500;
    context.res.body = {
      success: false,
      error: "Internal server error. Please try again later or contact us directly."
    };
  }
};