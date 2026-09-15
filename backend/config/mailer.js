const nodemailer = require('nodemailer');

const required = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];

async function sendWithResend(to, subject, text) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to: [to], subject, text }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Resend API returned ${response.status}`);
}

async function sendEmail(to, subject, text) {
  if (process.env.RESEND_API_KEY) return sendWithResend(to, subject, text);
  const transporter = getTransporter();
  await transporter.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
}

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
  await sendEmail(email, 'Your FinanceDash verification code', `Your FinanceDash password reset code is ${code}. It expires in 10 minutes.`);
}

async function sendVerificationCode(email, code) {
  await sendEmail(email, 'Verify your FinanceDash email', `Your FinanceDash email verification code is ${code}. It expires in 10 minutes.`);
}

module.exports = { sendResetCode, sendVerificationCode };
