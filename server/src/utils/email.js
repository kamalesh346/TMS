const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g. yourname@gmail.com
    pass: process.env.EMAIL_PASS, // App password or actual password (use dotenv)
  },
});

const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Transport System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
