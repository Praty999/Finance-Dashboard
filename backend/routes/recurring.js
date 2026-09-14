const express = require('express');
const prisma = require('../src/prisma');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  try {
    const items = await prisma.recurringTransaction.findMany({
      where: { userId: req.user.id }, orderBy: { nextDue: 'asc' },
    });
    res.json(items);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { title, amount, type = 'expense', category = 'Other', categoryName, frequency = 'Monthly', nextDue, paymentMethod = 'UPI' } = req.body;
    if (!title || !amount || !nextDue) return res.status(400).json({ message: 'title, amount, nextDue required' });
    const r = await prisma.recurringTransaction.create({
      data: {
        userId: req.user.id, title, amount: Number(amount), type,
        categoryName: categoryName || category || 'Other',
        frequency, nextDue: new Date(nextDue), paymentMethod,
      },
    });
    res.status(201).json(r);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.recurringTransaction.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Not found' });
    const data = { ...req.body };
    delete data.id; delete data.userId;
    if (data.amount != null) data.amount = Number(data.amount);
    if (data.nextDue) data.nextDue = new Date(data.nextDue);
    if (data.category && !data.categoryName) { data.categoryName = data.category; delete data.category; }
    const r = await prisma.recurringTransaction.update({ where: { id: existing.id }, data });
    res.json(r);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.recurringTransaction.deleteMany({ where: { id: Number(req.params.id), userId: req.user.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
