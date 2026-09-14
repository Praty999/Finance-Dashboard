const express = require('express');
const prisma = require('../src/prisma');
const auth = require('../middleware/auth');
const router = express.Router();
router.use(auth);

function monthRange(monthStr) {
  const m = monthStr || new Date().toISOString().slice(0, 7);
  const [y, mo] = m.split('-').map(Number);
  return { y, mo, start: new Date(y, mo - 1, 1), end: new Date(y, mo, 1) };
}
function lastNMonths(n) {
  const now = new Date(); const labels = [];
  for (let i = n - 1; i >= 0; i--) labels.push(new Date(now.getFullYear(), now.getMonth() - i, 1).toISOString().slice(0, 7));
  return labels;
}
async function sumByMonth(userId, label, type) {
  const [y, mo] = label.split('-').map(Number);
  const agg = await prisma.transaction.aggregate({
    where: { userId, type, date: { gte: new Date(y, mo - 1, 1), lt: new Date(y, mo, 1) } },
    _sum: { amount: true },
  });
  return agg._sum.amount || 0;
}

// GET /api/analytics/summary?month=YYYY-MM
router.get('/summary', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const { start, end } = monthRange(month);
    const grouped = await prisma.transaction.groupBy({
      by: ['type'],
      where: { userId: req.user.id, date: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    let income = 0, expense = 0;
    grouped.forEach((g) => { if (g.type === 'income') income = g._sum.amount || 0; if (g.type === 'expense') expense = g._sum.amount || 0; });
    res.json({ month, income, expense, savings: income - expense });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/analytics/income-vs-expense?months=6
router.get('/income-vs-expense', async (req, res) => {
  try {
    const n = Number(req.query.months || 6);
    const labels = lastNMonths(n);
    const income = [], expense = [];
    for (const l of labels) {
      income.push(await sumByMonth(req.user.id, l, 'income'));
      expense.push(await sumByMonth(req.user.id, l, 'expense'));
    }
    res.json({ labels, income, expense });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/analytics/expense-distribution?month=YYYY-MM
router.get('/expense-distribution', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const { start, end } = monthRange(month);
    const grouped = await prisma.transaction.groupBy({
      by: ['categoryName'],
      where: { userId: req.user.id, type: 'expense', date: { gte: start, lt: end } },
      _sum: { amount: true },
    });
    grouped.sort((a, b) => (b._sum.amount || 0) - (a._sum.amount || 0));
    res.json({ labels: grouped.map((g) => g.categoryName), values: grouped.map((g) => g._sum.amount || 0) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/analytics/monthly-spending?months=6
router.get('/monthly-spending', async (req, res) => {
  try {
    const n = Number(req.query.months || 6);
    const labels = lastNMonths(n);
    const values = [];
    for (const l of labels) values.push(await sumByMonth(req.user.id, l, 'expense'));
    res.json({ labels, values });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET savings-trend
router.get('/savings-trend', async (req, res) => {
  try {
    const n = Number(req.query.months || 6);
    const labels = lastNMonths(n);
    const values = [];
    for (const l of labels) {
      values.push((await sumByMonth(req.user.id, l, 'income')) - (await sumByMonth(req.user.id, l, 'expense')));
    }
    res.json({ labels, values });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET insights
router.get('/insights', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const { y, mo, start: curS, end: curE } = monthRange(month);
    const prevM = mo === 1 ? 12 : mo - 1;
    const prevY = mo === 1 ? y - 1 : y;
    const prevS = new Date(prevY, prevM - 1, 1), prevE = new Date(prevY, prevM, 1);
    const sumCat = async (s, e) => {
      const g = await prisma.transaction.groupBy({
        by: ['categoryName'],
        where: { userId: req.user.id, type: 'expense', date: { gte: s, lt: e } },
        _sum: { amount: true },
      });
      return g.map((x) => ({ _id: x.categoryName, total: x._sum.amount || 0 })).sort((a, b) => b.total - a.total);
    };
    const [cur, prev] = await Promise.all([sumCat(curS, curE), sumCat(prevS, prevE)]);
    const insights = [];
    if (!cur.length) { insights.push('No expenses yet. Add a transaction to unlock insights.'); return res.json({ insights }); }
    const largest = cur[0];
    insights.push(`Your largest expense category is ${largest._id.toLowerCase()} (Rs.${largest.total.toLocaleString('en-IN')}).`);
    const prevMap = Object.fromEntries(prev.map((p) => [p._id, p.total]));
    cur.forEach((c) => {
      const p = prevMap[c._id] || 0;
      if (p && c.total > p) {
        const pct = Math.round(((c.total - p) / p) * 100);
        insights.push(`Your spending on ${c._id.toLowerCase()} increased ${pct}% vs last month (Rs.${p} -> Rs.${c.total}).`);
      }
    });
    const budgets = await prisma.budget.findMany({ where: { userId: req.user.id, month: mo, year: y } });
    budgets.forEach((b) => {
      const spent = (cur.find((c) => c._id === b.categoryName) || {}).total || 0;
      if (spent <= b.amount) insights.push(`You stayed within your ${b.categoryName.toLowerCase()} budget (Rs.${spent} / Rs.${b.amount}).`);
      else insights.push(`Warning: exceeded ${b.categoryName.toLowerCase()} budget (Rs.${spent} / Rs.${b.amount}).`);
    });
    if (insights.length === 1) insights.push('Spending stable vs last month. Keep tracking daily.');
    res.json({ insights });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
