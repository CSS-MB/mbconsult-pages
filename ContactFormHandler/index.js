const nodemailer = require('nodemailer');

module.exports = async function (context, req) {
  const { name, email, message } = req.body;

  let transporter = nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.OFFICE365_USER,
      pass: process.env.OFFICE365_PASS
    }
  });

  let mailOptions = {
    from: process.env.OFFICE365_USER,
    to: 'mathew@mbconsult.io',
    subject: `Contact Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  try {
    await transporter.sendMail(mailOptions);
    context.res = { status: 200, body: "Email sent successfully." };
  } catch (error) {
    context.res = { status: 500, body: "Failed to send email." };
  }
};
