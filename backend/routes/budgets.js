const express = require('express');
const prisma = require('../src/prisma');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

function parseMonth(monthStr) {
  const m = monthStr || new Date().toISOString().slice(0, 7);
  const [y, mo] = m.split('-').map(Number);
  return { y, mo, start: new Date(y, mo - 1, 1), end: new Date(y, mo, 1) };
}

// GET /api/budgets?month=YYYY-MM -> budgets with spent + pct
router.get('/', async (req, res) => {
  try {
    const { y, mo, start, end } = parseMonth(req.query.month);
    const budgets = await prisma.budget.findMany({ where: { userId: req.user.id, month: mo, year: y } });
    const grouped = await prisma.transaction.groupBy({
      by: ['categoryName'],
      where: { userId: req.user.id, type: 'expense', date: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    const spentMap = Object.fromEntries(grouped.map((g) => [g.categoryName, g._sum.amount || 0]));
    const out = budgets.map((b) => {
      const spent = spentMap[b.categoryName] || 0;
      const pct = b.amount ? Math.round((spent / b.amount) * 100) : 0;
      // keep old frontend field names too: limit/category
      return { ...b, category: b.categoryName, limit: b.amount, spent, pct, over: spent > b.amount };
    });
    res.json(out);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/budgets {category, month: YYYY-MM, limit} upsert
router.post('/', async (req, res) => {
  try {
    const { category, month, limit, amount } = req.body;
    if (!category || !month || (limit == null && amount == null))
      return res.status(400).json({ message: 'category, month, limit required' });
    const { y, mo } = parseMonth(month);
    const value = Number(limit != null ? limit : amount);
    let cat = await prisma.category.findFirst({ where: { userId: req.user.id, name: category } });
    const b = await prisma.budget.upsert({
      where: { userId_categoryName_month_year: { userId: req.user.id, categoryName: category, month: mo, year: y } },
      update: { amount: value, categoryId: cat ? cat.id : null },
      create: { userId: req.user.id, categoryId: cat ? cat.id : null, categoryName: category, amount: value, month: mo, year: y },
    });
    res.status(201).json({ ...b, category: b.categoryName, limit: b.amount });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.budget.deleteMany({ where: { id: Number(req.params.id), userId: req.user.id } });
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
