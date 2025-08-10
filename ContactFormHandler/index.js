const nodemailer = require('nodemailer');

module.exports = async function (context, req) {
    context.log('HTTP trigger function received a request.');

    // Setup CORS for browser clients
    context.res = context.res || {};
    context.res.headers = context.res.headers || {};
    context.res.headers['Access-Control-Allow-Origin'] = 'https://mbconsult.io'; // Update if you use another prod domain
    context.res.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    context.res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Accept';

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        context.res.status = 204;
        context.done();
        return;
    }

    // Parse and validate incoming data
    const { name, email, message, company } = req.body || {};
    if (company) {
        // Honeypot spam trap: silent success
        context.log('Spam honeypot triggered.');
        context.res = {
            status: 200,
            body: { success: true }
        };
        return;
    }

    const errors = [];
    if (!name || typeof name !== 'string' || !name.trim()) errors.push('Name is required.');
    if (
        !email ||
        typeof email !== 'string' ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) errors.push('Valid email is required.');
    if (!message || typeof message !== 'string' || !message.trim()) errors.push('Message is required.');

    if (errors.length) {
        context.log('Validation errors:', errors);
        context.res = {
            status: 400,
            body: { success: false, errors }
        };
        return;
    }

    // SMTP configuration - uses environment variables for secrets
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,            // e.g., 'smtp.office365.com'
        port: process.env.SMTP_PORT || 465,     // 465 for SSL, 587 for TLS
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,        // Your SMTP username
            pass: process.env.SMTP_PASS         // Your SMTP password
        }
    });

    // Construct the email
    const toAddress = process.env.CONTACT_TO || 'your@email.com';
    const ccAddress = process.env.CONTACT_CC;   // Optional, e.g., 'cc@email.com'
    const bccAddress = process.env.CONTACT_BCC; // Optional, e.g., 'bcc@email.com'
    const subject = process.env.CONTACT_SUBJECT || 'New Contact Form Submission';

    const plainText = `
        Name: ${name}
        Email: ${email}
        Message: ${message}
    `.trim();

    const htmlBody = `
        <div style="font-family: Arial, sans-serif; font-size: 15px;">
            <h2>New Contact Form Submission</h2>
            <p><b>Name:</b> ${name}</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Message:</b><br/>${message.replace(/\n/g, '<br/>')}</p>
        </div>
    `;

    const mailOptions = {
        from: `"MBConsult Contact" <${process.env.SMTP_USER}>`,
        to: toAddress,
        subject: subject,
        text: plainText,
        html: htmlBody
    };

    // Add CC/BCC if provided in environment
    if (ccAddress) mailOptions.cc = ccAddress;
    if (bccAddress) mailOptions.bcc = bccAddress;

    try {
        await transporter.sendMail(mailOptions);
        context.log('Contact form email sent successfully.');
        context.res = {
            status: 200,
            body: { success: true, message: 'Your message has been delivered.' }
        };
    } catch (err) {
        context.log.error('Email sending failed:', err);
        context.res = {
            status: 500,
            body: { success: false, message: 'Failed to deliver message. Please try again later.' }
        };
    }
};
