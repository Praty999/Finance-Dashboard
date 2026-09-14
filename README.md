# 💰 Finance Dashboard — Express + React + PostgreSQL + Prisma

Your recommended stack, implemented:
- Frontend: React + React Router + **Tailwind CSS** + Chart.js + Axios → deploy **Vercel**
- Backend: Node.js + Express.js + JWT + REST API → deploy **Render / Railway**
- Database: **PostgreSQL + Prisma ORM** → Neon / Supabase / Render

## Schema (Prisma)
- `User(id, name, email, passwordHash, createdAt)`
- `Category(id, userId, name, type)` — defaults seeded on register
- `Transaction(id, userId, categoryId, categoryName, type, amount, description, date, paymentMethod, createdAt)`
- `Budget(id, userId, categoryId, categoryName, amount, month, year)` — unique(userId, categoryName, month, year)
- `RecurringTransaction(id, userId, title, amount, type, categoryName, frequency, nextDue, ...)`

## 1) Install PostgreSQL (pick ONE)

**Option A — Docker (easiest, no install):**
```bash
docker compose up -d db
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/finance_dashboard
