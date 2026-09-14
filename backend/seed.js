require('dotenv').config();
const bcrypt = require('bcryptjs');
const prisma = require('./src/prisma');

const CATS = [
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

(async () => {
  console.log('Seeding Postgres:', process.env.DATABASE_URL);
  try {
    // wipe demo data (FK-safe order)
    await prisma.transaction.deleteMany();
    await prisma.budget.deleteMany();
    await prisma.recurringTransaction.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: { name: 'Demo User', email: 'demo@demo.com', passwordHash: await bcrypt.hash('demo123', 10) },
    });
    console.log('Demo login -> demo@demo.com / demo123');

    const cats = await Promise.all(
      CATS.map((c) => prisma.category.create({ data: { ...c, userId: user.id } }))
    );
    const catByName = Object.fromEntries(cats.map((c) => [c.name, c]));
    const now = new Date();
    const D = (off) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + off);
    const mk = (off, name, type, amount, desc, pm = 'UPI') => ({
      userId: user.id,
      categoryId: catByName[name].id,
      categoryName: name,
      type, amount, description: desc, paymentMethod: pm,
      date: D(off),
    });

    await prisma.transaction.createMany({
      data: [
        mk(-1, 'Salary', 'income', 50000, 'Monthly salary', 'Bank Transfer'),
        mk(-5, 'Freelance', 'income', 8000, 'Logo design', 'UPI'),
        mk(-1, 'Food', 'expense', 3800, 'Groceries + Swiggy', 'UPI'),
        mk(-2, 'Shopping', 'expense', 4200, 'Myntra sale', 'Card'),
        mk(-3, 'Transport', 'expense', 1200, 'Metro + cab', 'Wallet'),
        mk(-6, 'Education', 'expense', 6500, 'Udemy + books', 'Card'),
        mk(-8, 'Bills', 'expense', 2100, 'Electricity', 'NetBanking'),
        mk(-20, 'Food', 'expense', 2900, 'Last month groceries', 'Cash'),
        mk(-40, 'Transport', 'expense', 1500, 'Prev month travel', 'Cash'),
      ],
    });

    const y = now.getFullYear(), mo = now.getMonth() + 1;
    await prisma.budget.createMany({
      data: [
        { userId: user.id, categoryId: catByName['Food'].id, categoryName: 'Food', amount: 5000, month: mo, year: y },
        { userId: user.id, categoryId: catByName['Shopping'].id, categoryName: 'Shopping', amount: 4000, month: mo, year: y },
        { userId: user.id, categoryId: catByName['Transport'].id, categoryName: 'Transport', amount: 2000, month: mo, year: y },
      ],
    });

    await prisma.recurringTransaction.createMany({
      data: [
        { userId: user.id, title: 'Netflix', amount: 649, type: 'expense', categoryName: 'Entertainment', frequency: 'Monthly', nextDue: new Date(y, mo, 5) },
        { userId: user.id, title: 'Rent', amount: 12000, type: 'expense', categoryName: 'Bills', frequency: 'Monthly', nextDue: new Date(y, mo, 1) },
        { userId: user.id, title: 'Internet', amount: 799, type: 'expense', categoryName: 'Bills', frequency: 'Monthly', nextDue: new Date(y, mo, 10) },
        { userId: user.id, title: 'Salary', amount: 50000, type: 'income', categoryName: 'Salary', frequency: 'Monthly', nextDue: new Date(y, mo, 1) },
      ],
    });

    console.log('Seed done');
  } catch (e) {
    console.error('Seed failed:', e.message);
    console.error('Did you run: npx prisma db push  (and is Postgres running + DATABASE_URL correct?)');
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();

