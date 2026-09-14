import { useEffect, useMemo, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler, chartTheme } from '../components/charts';
import api from '../api';
import { PageHeader, StatCard, Card, SectionTitle, SkeletonCards, SavingsRing } from '../components/ui';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler);

const { grid, tick, tip, palette: PALETTE } = chartTheme;

export default function Dashboard() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [sum, setSum] = useState({ income: 0, expense: 0, savings: 0 });
  const [ive, setIve] = useState({ labels: [], income: [], expense: [] });
  const [dist, setDist] = useState({ labels: [], values: [] });
  const [spend, setSpend] = useState({ labels: [], values: [] });
  const [sav, setSav] = useState({ labels: [], values: [] });
  const [insights, setInsights] = useState([]);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async (m) => {
    setLoading(true);
    try {
      const [s, a, d, ms, st, ins, tx] = await Promise.all([
        api.get('/analytics/summary', { params: { month: m } }),
        api.get('/analytics/income-vs-expense', { params: { months: 6 } }),
        api.get('/analytics/expense-distribution', { params: { month: m } }),
        api.get('/analytics/monthly-spending', { params: { months: 6 } }),
        api.get('/analytics/savings-trend', { params: { months: 6 } }),
        api.get('/analytics/insights', { params: { month: m } }),
        api.get('/transactions', { params: { limit: 5 } }),
      ]);
      setSum(s.data); setIve(a.data); setDist(d.data); setSpend(ms.data); setSav(st.data);
      setInsights(ins.data.insights || []); setRecent(tx.data.items || []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(month); }, [month]);

  const savingsRate = useMemo(() => sum.income > 0 ? Math.round((sum.savings / sum.income) * 100) : 0, [sum]);
  const topCat = useMemo(() => dist.labels?.[0] || 'None', [dist]);

  if (loading) return <div className="page"><SkeletonCards n={3} /><div className="skeleton skel-hero"><div className="shimmer shimmer-full" /></div></div>;

  return (
    <div className="page">
      <PageHeader eyebrow="Your financial overview" title="Money, beautifully tracked."
        sub={`Income vs spend, savings rate, top category and smart insights for ${month}.`}
        right={<input type="month" value={month} onChange={e => setMonth(e.target.value)} className="field field-auto" />} />

      <div className="stagger quad-grid">
        <StatCard label="Income" value={sum.income} icon="+" tone="mint" delta="6-mo tracked" />
        <StatCard label="Expenses" value={sum.expense} icon="-" tone="rose" delay={80} delta={topCat !== 'None' ? `Top: ${topCat}` : 'No spend'} />
        <StatCard label="Savings" value={Math.max(0, sum.savings)} icon="$" tone="iris" delay={160} delta={`${savingsRate}% saved`} />
        <div className="glass card-hover anim-pop stat-card" style={{ animationDelay: '240ms' }}>
          <p className="stat-label">Savings rate</p>
          <div className="ring-gap"><SavingsRing pct={savingsRate} label={savingsRate >= 20 ? 'Healthy — keep compounding.' : 'Tip: trim top category 10%.'} /></div>
        </div>
      </div>

      {recent.length > 0 && (
        <div className="ticker-wrap anim-page ticker-gap">
          <div className="ticker">
            {[...recent, ...recent].map((t, i) => (
              <span key={i} className={`chip ${t.type === 'income' ? 'chip-income' : 'chip-expense'}`}>
                {t.categoryName} - Rs.{Number(t.amount).toLocaleString('en-IN')}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="stagger duo-grid chart-gap">
        <Card delay={100}>
          <SectionTitle icon="^" title="Income vs Expenses" sub="Last 6 months momentum" right={<span className="chip">6M</span>} />
          <div className="chart-tall"><Bar data={{ labels: ive.labels, datasets: [
            { label: 'Income', data: ive.income, backgroundColor: '#10b981', borderRadius: 8, barThickness: 14 },
            { label: 'Expense', data: ive.expense, backgroundColor: '#f43f5e', borderRadius: 8, barThickness: 14 }] }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#cbd5e1' } }, tooltip: tip }, scales: { x: { grid: { display: false }, ticks: tick }, y: { grid: { color: grid }, ticks: tick } } }} /></div>
        </Card>
        <Card delay={180}>
          <SectionTitle icon="o" title="Where money went" sub={`Expense mix - ${month}`} right={<span className="chip">{dist.labels?.length || 0} cats</span>} />
          <div className="chart-donut"><Doughnut data={{ labels: dist.labels, datasets: [{ data: dist.values, backgroundColor: PALETTE, borderColor: '#0b1120', borderWidth: 3, hoverOffset: 10 }] }}
            options={{ responsive: true, maintainAspectRatio: false, cutout: '62%', plugins: { legend: { position: 'bottom', labels: { color: '#cbd5e1', boxWidth: 12, padding: 12 } }, tooltip: tip } }} /></div>
        </Card>
        <Card delay={260}>
          <SectionTitle icon="#" title="Monthly spending" sub="Burn-down - 6 months" />
          <div className="chart-short"><Bar data={{ labels: spend.labels, datasets: [{ label: 'Spent', data: spend.values, backgroundColor: '#6366f1', borderRadius: 10, barThickness: 18 }] }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: tip }, scales: { x: { grid: { display: false }, ticks: tick }, y: { grid: { color: grid }, ticks: tick } } }} /></div>
        </Card>
        <Card delay={340}>
          <SectionTitle icon="~" title="Savings trend" sub="Income minus expense" right={<span className="chip chip-income">net</span>} />
          <div className="chart-short"><Line data={{ labels: sav.labels, datasets: [{ label: 'Savings', data: sav.values, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.2)', fill: true, tension: 0.45, pointRadius: 4, pointBackgroundColor: '#a78bfa', borderWidth: 3 }] }}
            options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: tip }, scales: { x: { grid: { display: false }, ticks: tick }, y: { grid: { color: grid }, ticks: tick } } }} /></div>
        </Card>
      </div>

      <Card delay={420} className="gap-top insight-card">
        <SectionTitle icon="*" title="Smart insights" sub="Rule engine on /analytics/insights" />
        {insights.length === 0 ? <p className="pager-info">No insights yet — add transactions.</p> :
          <div className="insight-grid">{insights.map((t, i) => (
            <div key={i} className="anim-pop insight-item" style={{ animationDelay: `${i * 90}ms` }}>{t}</div>))}</div>}
      </Card>

      <div className="gap-top">
        <div className="glass mini-card">
          <b className="cell-strong">This month</b>
          <p className="gap-top-sm pager-info">Top category: <b className="cell-strong">{topCat}</b> - change month to animate all charts.</p>
        </div>
      </div>
    </div>
  );
}

