const nodemailer = require("nodemailer");

module.exports = async function (context, req) {
  // Set CORS headers for all responses
  const corsHeaders = {
    "Access-Control-Allow-Origin": "https://mbconsult.io",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Access-Control-Max-Age": "86400"
  };

  // Handle OPTIONS (preflight) request
  if (req.method === "OPTIONS") {
    context.res = {
      status: 204,
      headers: corsHeaders,
      body: null
    };
    return;
  }

  // Only allow POST for actual form submission
  if (req.method !== "POST") {
    context.res = {
      status: 405,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: "Method not allowed" })
    };
    return;
  }

  try {
    const { name, email, message, company } = req.body || {};

    // Honeypot check - if company field is present and not empty, silently succeed
    if (company && company.trim() !== "") {
      context.log("Honeypot triggered - silently discarding spam submission");
      context.res = {
        status: 200,
        headers: corsHeaders,
        body: JSON.stringify({ success: true })
      };
      return;
    }

    // Server-side validation
    const errors = [];
    
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
      errors.push("Name must be between 2 and 100 characters");
    }
    
    if (!email || typeof email !== 'string') {
      errors.push("Email is required");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push("Please enter a valid email address");
      } else if (email.trim().length > 254) {
        errors.push("Email address is too long");
      }
    }
    
    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.trim().length > 2000) {
      errors.push("Message must be between 10 and 2000 characters");
    }

    // If validation errors, return them
    if (errors.length > 0) {
      context.log("Validation failed:", errors);
      context.res = {
        status: 400,
        headers: corsHeaders,
        body: JSON.stringify({ success: false, errors: errors })
      };
      return;
    }

    // Create email transporter
    let transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.OFFICE365_USER,
        pass: process.env.OFFICE365_PASS,
      },
    });

    // Prepare email
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim();
    const sanitizedMessage = message.trim();
    
    let mailOptions = {
      from: process.env.OFFICE365_USER,
      to: "mathew@mbconsult.io",
      subject: `Contact Form Submission from ${sanitizedName}`,
      text: `Name: ${sanitizedName}\nEmail: ${sanitizedEmail}\nMessage: ${sanitizedMessage}`,
      html: `
        <h3>Contact Form Submission</h3>
        <p><strong>Name:</strong> ${sanitizedName}</p>
        <p><strong>Email:</strong> ${sanitizedEmail}</p>
        <p><strong>Message:</strong></p>
        <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);
    
    context.log(`Email sent successfully for ${sanitizedName} (${sanitizedEmail})`);
    
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    context.log.error("Error processing contact form:", error);
    
    // Don't expose internal error details to client
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        success: false, 
        error: "Internal server error. Please try again later." 
      })
    };
  }
};