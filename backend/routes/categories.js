const express = require('express');
const prisma = require('../src/prisma');
const auth = require('../middleware/auth');
const router = express.Router();

const DEFAULTS = [
  { name: 'Salary', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Scholarship', type: 'income' },
  { name: 'Other', type: 'income' },
  { name: 'Food', type: 'expense' },
  { name: 'Transport', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Education', type: 'expense' },
  { name: 'Entertainment', type: 'expense' },
  { name: 'Bills', type: 'expense' },
  { name: 'Health', type: 'expense' },
  { name: 'Other', type: 'expense' },
];

router.use(auth);

router.get('/', async (req, res) => {
  try {
    let mine = await prisma.category.findMany({ where: { userId: req.user.id }, orderBy: [{ type: 'asc' }, { name: 'asc' }] });
    if (mine.length === 0) {
      // auto-seed defaults on first read (register also seeds)
      await prisma.category.createMany({ data: DEFAULTS.map((d) => ({ ...d, userId: req.user.id })), skipDuplicates: true });
      mine = await prisma.category.findMany({ where: { userId: req.user.id }, orderBy: [{ type: 'asc' }, { name: 'asc' }] });
    }
    res.json(mine);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ message: 'name & type required' });
    if (!['income', 'expense'].includes(type)) return res.status(400).json({ message: 'Invalid category type' });
    const c = await prisma.category.create({ data: { userId: req.user.id, name, type } });
    res.status(201).json(c);
  } catch (e) { res.status(500).json({ message: e.response?.data?.message || e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const c = await prisma.category.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
    if (!c) return res.status(404).json({ message: 'Not found' });
    await prisma.category.delete({ where: { id: c.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
module.exports.DEFAULTS = DEFAULTS;
