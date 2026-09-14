const jwt = require('jsonwebtoken');
const prisma = require('../src/prisma');

module.exports = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret_finance_key_change_this');
    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.id) },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    if (!user) return res.status(401).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};
