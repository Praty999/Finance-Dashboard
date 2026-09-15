const nodemailer = require('nodemailer');

const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];

function getTransporter() {
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error('Password reset email is not configured');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

async function sendResetCode(email, code) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Your FinanceDash verification code',
    text: `Your FinanceDash password reset code is ${code}. It expires in 10 minutes.`,
  });
}

async function sendVerificationCode(email, code) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Verify your FinanceDash email',
    text: `Your FinanceDash email verification code is ${code}. It expires in 10 minutes.`,
  });
}

module.exports = { sendResetCode, sendVerificationCode };
