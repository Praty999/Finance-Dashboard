const express = require('express');
const prisma = require('../src/prisma');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

async function resolveCategory(userId, name, type) {
  if (!name || !['income', 'expense'].includes(type)) return null;
  const cat = await prisma.category.findFirst({ where: { userId, name, type } });
  return cat ? { categoryId: cat.id, categoryName: cat.name } : null;
}

// GET /api/transactions?search=&type=&category=&from=&to=&page=1&limit=10
router.get('/', async (req, res) => {
  try {
    const { search = '', type, category, from, to, page = 1, limit = 10 } = req.query;
    const where = { userId: req.user.id };
    if (type) where.type = type;
    if (category) where.categoryName = category;
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    if (search) {
      where.OR = [
        { description: { contains: search, mode: 'insensitive' } },
        { categoryName: { contains: search, mode: 'insensitive' } },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      prisma.transaction.findMany({ where, orderBy: { date: 'desc' }, skip, take: Number(limit) }),
      prisma.transaction.count({ where }),
    ]);
    res.json({ items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/transactions
router.post('/', async (req, res) => {
  try {
    const { type, amount, category, date, description = '', paymentMethod = 'UPI' } = req.body;
    if (!type || !amount || !category || !date) return res.status(400).json({ message: 'type, amount, category, date required' });
    if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'Invalid transaction type' });
    const resolved = await resolveCategory(req.user.id, category, type);
    if (!resolved) return res.status(400).json({ message: 'Category does not match the transaction type' });
    const { categoryId, categoryName } = resolved;
    const t = await prisma.transaction.create({
      data: { userId: req.user.id, type, amount: Number(amount), categoryId, categoryName, date: new Date(date), description, paymentMethod },
    });
    res.status(201).json(t);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/transactions/:id
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.transaction.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const data = { ...req.body };
    delete data.id; delete data.userId;
    if (data.amount != null) data.amount = Number(data.amount);
    if (data.date) data.date = new Date(data.date);
    if (data.category || data.type) {
      const resolved = await resolveCategory(req.user.id, data.category || existing.categoryName, data.type || existing.type);
      if (!resolved) return res.status(400).json({ message: 'Category does not match the transaction type' });
      const { categoryId, categoryName } = resolved;
      data.categoryId = categoryId; data.categoryName = categoryName;
      delete data.category;
    }
    const t = await prisma.transaction.update({ where: { id: existing.id }, data });
    res.json(t);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/transactions/:id
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.transaction.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    await prisma.transaction.delete({ where: { id: existing.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
