const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const prisma = require('../src/prisma');
const auth = require('../middleware/auth');
const { sendResetCode, sendVerificationCode } = require('../config/mailer');

const router = express.Router();

const genToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_finance_key_change_this', {
  expiresIn: process.env.JWT_EXPIRE || '7d',
});

async function findUserByEmail(email) {
  return prisma.user.findFirst({ where: { email: { equals: email.toLowerCase().trim(), mode: 'insensitive' } } });
}

// POST /api/auth/register
router.post('/register',
  body('name').notEmpty().withMessage('Name required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Min 6 chars'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { name, email: rawEmail, password } = req.body;
    const email = rawEmail.toLowerCase().trim();
    try {
      const existing = await findUserByEmail(email);
      if (existing) return res.status(400).json({ message: 'User already exists' });
      const passwordHash = await bcrypt.hash(password, 10);
      const verificationCode = crypto.randomInt(100000, 1000000).toString();
      const user = await prisma.user.create({ data: {
        name,
        email,
        passwordHash,
        emailVerified: false,
        emailVerificationToken: crypto.createHash('sha256').update(verificationCode).digest('hex'),
        emailVerificationExpire: new Date(Date.now() + 10 * 60 * 1000),
      } });
      // seed default categories for this user
      await prisma.category.createMany({
        data: [
          { name: 'Salary', type: 'income', userId: user.id },
          { name: 'Freelance', type: 'income', userId: user.id },
          { name: 'Scholarship', type: 'income', userId: user.id },
          { name: 'Other', type: 'income', userId: user.id },
          { name: 'Food', type: 'expense', userId: user.id },
          { name: 'Transport', type: 'expense', userId: user.id },
          { name: 'Shopping', type: 'expense', userId: user.id },
          { name: 'Education', type: 'expense', userId: user.id },
          { name: 'Entertainment', type: 'expense', userId: user.id },
          { name: 'Bills', type: 'expense', userId: user.id },
          { name: 'Health', type: 'expense', userId: user.id },
          { name: 'Other', type: 'expense', userId: user.id },
        ],
        skipDuplicates: true,
      });
      try {
        await sendVerificationCode(user.email, verificationCode);
      } catch (mailError) {
        await prisma.user.delete({ where: { id: user.id } });
        return res.status(503).json({ message: 'Verification email is temporarily unavailable. Please try again later.' });
      }
      res.status(201).json({ message: 'Verification code sent to your email', verificationRequired: true, email: user.email });
    } catch (e) { res.status(500).json({ message: 'Unable to create the account' }); }
  });

// POST /api/auth/verify-email
router.post('/verify-email', body('email').isEmail(), body('code').isLength({ min: 6, max: 6 }).isNumeric(), async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const user = await findUserByEmail(email);
    if (!user || user.emailVerified || !user.emailVerificationToken || !user.emailVerificationExpire || user.emailVerificationExpire < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    if (user.emailVerificationAttempts >= 5) return res.status(429).json({ message: 'Too many attempts. Please create the account again.' });
    const codeHash = crypto.createHash('sha256').update(req.body.code).digest('hex');
    if (codeHash !== user.emailVerificationToken) {
      await prisma.user.update({ where: { id: user.id }, data: { emailVerificationAttempts: { increment: 1 } } });
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true, emailVerificationToken: null, emailVerificationExpire: null, emailVerificationAttempts: 0 } });
    res.json({ token: genToken(user.id), user: { id: user.id, name: user.name, email: user.email } });
  } catch (e) { res.status(500).json({ message: 'Unable to verify the email' }); }
});

// POST /api/auth/login
router.get('/check-email', async (req, res) => {
  const email = String(req.query.email || '').trim();
  if (!email) return res.status(400).json({ message: 'Email is required' });
  try {
    const user = await findUserByEmail(email);
    res.json({ exists: Boolean(user) });
  } catch (e) { res.status(500).json({ message: 'Unable to check the email' }); }
});

router.post('/login',
  body('email').isEmail(), body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    try {
      const user = await findUserByEmail(email);
      if (!user) return res.status(404).json({ message: 'No account found with this email. Please check your email or create an account.' });
      if (!user.emailVerified) return res.status(403).json({ message: 'Please verify your email before logging in.' });
      if (!(await bcrypt.compare(password, user.passwordHash)))
        return res.status(401).json({ message: 'Invalid credentials' });
      res.json({
        token: genToken(user.id),
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (e) { res.status(500).json({ message: e.message }); }
  });

// GET /api/auth/me
router.get('/me', auth, (req, res) => res.json(req.user));

// POST /api/auth/forgotpassword
router.post('/forgotpassword', body('email').isEmail(), async (req, res) => {
  const genericMessage = 'If an account exists for that email, a verification code has been sent.';
  try {
    const email = req.body.email.toLowerCase().trim();
    const user = await findUserByEmail(email);
    if (!user) return res.json({ message: genericMessage });

    if (user.resetPasswordSentAt && Date.now() - user.resetPasswordSentAt.getTime() < 60 * 1000) {
      return res.json({ message: genericMessage });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: crypto.createHash('sha256').update(code).digest('hex'),
        resetPasswordExpire: new Date(Date.now() + 15 * 60 * 1000),
        resetPasswordAttempts: 0,
        resetPasswordSentAt: new Date(),
      },
    });
    try {
      await sendResetCode(user.email, code);
    } catch (mailError) {
      await prisma.user.update({
        where: { id: user.id },
        data: { resetPasswordToken: null, resetPasswordExpire: null, resetPasswordAttempts: 0, resetPasswordSentAt: null },
      });
      return res.status(503).json({ message: 'Password reset email is temporarily unavailable. Please try again later.' });
    }
    res.json({ message: genericMessage });
  } catch (e) { res.status(500).json({ message: 'Unable to process the password reset request' }); }
});

// POST /api/auth/verify-reset-code
router.post('/verify-reset-code', body('email').isEmail(), body('code').isLength({ min: 6, max: 6 }).isNumeric(), async (req, res) => {
  try {
    const email = req.body.email.toLowerCase().trim();
    const user = await findUserByEmail(email);
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpire || user.resetPasswordExpire < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    if (user.resetPasswordAttempts >= 5) {
      return res.status(429).json({ message: 'Too many verification attempts. Request a new code.' });
    }

    const codeHash = crypto.createHash('sha256').update(req.body.code).digest('hex');
    if (codeHash !== user.resetPasswordToken) {
      await prisma.user.update({ where: { id: user.id }, data: { resetPasswordAttempts: { increment: 1 } } });
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: crypto.createHash('sha256').update(resetToken).digest('hex'),
        resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000),
        resetPasswordAttempts: 0,
      },
    });
    res.json({ resetToken });
  } catch (e) { res.status(500).json({ message: 'Unable to verify the code' }); }
});

// PUT /api/auth/resetpassword/:token
router.put('/resetpassword/:token', body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: hashed, resetPasswordExpire: { gt: new Date() } },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await bcrypt.hash(req.body.password, 10),
        resetPasswordToken: null,
        resetPasswordExpire: null,
        resetPasswordAttempts: 0,
        resetPasswordSentAt: null,
      },
    });
    res.json({ message: 'Password reset successful', token: genToken(user.id) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

