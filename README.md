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
```

**Option B — Local Postgres on Windows:**
1. Download installer: https://www.postgresql.org/download/windows/ (PostgreSQL 16)
2. During install set password `postgres` (matches default DATABASE_URL)
3. Open pgAdmin or psql and create db:
```sql
CREATE DATABASE finance_dashboard;
```

**Option C — Free cloud (Neon, best for resume + deploy):**
1. https://neon.tech → New project → copy connection string
2. Put it in `backend/.env` as `DATABASE_URL="postgresql://..."`

## 2) Backend setup
```bash
cd backend
copy .env.example .env
# edit .env -> set DATABASE_URL
npm install
npx prisma generate
npx prisma db push        # creates tables (no migration files needed for start)
npm run db:seed           # demo@demo.com / demo123 + sample data
npm run dev               # http://localhost:5000  (health: /api/health)
```

Useful:
```bash
npx prisma migrate dev --name init   # if you prefer migrations
npx prisma studio                    # visual DB browser
```

## 3) Frontend setup
```bash
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Login: `demo@demo.com / demo123`

## 4) Docker (full stack)
```bash
docker compose up --build
# frontend :5173, backend :5000, db :5432
```

## 5) Deploy
- **DB:** Neon (https://neon.tech) → copy `DATABASE_URL` with `?sslmode=require`
- **Backend:** Render/Railway → root `backend/`, build `npm install && npx prisma generate && npx prisma db push`, start `node server.js`, env `DATABASE_URL, JWT_SECRET, CLIENT_URL`
- **Frontend:** Vercel → root `frontend/`, env `VITE_API_URL=https://<backend>/api`

## 6) Features (your 7 points)
1. Auth: Register/Login/Logout/Forgot+Reset/Protected dashboard
2. Transactions: Income/Expense + Amount/Category/Date/Description/Payment
3. Categories: Salary/Freelance/Scholarship/Other + Food/Transport/Shopping/Education/Entertainment/Bills/Health/Other
4. Monthly Budget with progress + over-budget warning
5. Analytics: Income vs Exp (Bar), Distribution (Pie), Monthly spending (Bar), Savings trend (Line) via Chart.js
6. Search transactions (text + filters + pagination)
7. Recurring + Financial Insights box

