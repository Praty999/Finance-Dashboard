import { useEffect, useState } from 'react';
import api, { inr } from '../api';
import { PageHeader, Card, SectionTitle, Empty } from '../components/ui';
export default function Budgets() {
  const monthNow = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(monthNow);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ category: 'Food', limit: '' });
  const load = () => api.get('/budgets', { params: { month } }).then(r => setItems(r.data));
  useEffect(() => { load(); }, [month]);
  const save = async (e) => { e.preventDefault(); await api.post('/budgets', { ...form, month }); setForm({ category: 'Food', limit: '' }); load(); };
  const del = async (id) => { await api.delete(`/budgets/${id}`); load(); };
  const totalL = items.reduce((a, b) => a + Number(b.limit ?? b.amount ?? 0), 0);
  const totalS = items.reduce((a, b) => a + Number(b.spent ?? 0), 0);
  return (
    <div className="page">
      <PageHeader eyebrow="Guardrails" title="Budgets" sub="Per-category monthly caps. Over-spend glows red with animated progress."
        right={<input type="month" value={month} onChange={e => setMonth(e.target.value)} className="field field-auto" />} />
      <div className="stagger trio-grid">
        <div className="glass mini-card"><p className="mini-label">Total capped</p><p className="font-display mini-value">{inr(totalL)}</p></div>
        <div className="glass mini-card"><p className="mini-label">Total spent</p><p className="font-display mini-value">{inr(totalS)}</p></div>
        <div className="glass mini-card"><p className="mini-label">Left</p><p className={`font-display mini-value ${totalL - totalS < 0 ? 'amt-out' : 'amt-in'}`}>{inr(totalL - totalS)}</p></div>
      </div>
      <Card className="gap-top" delay={100}>
        <SectionTitle icon="+" title="Set a cap" sub="Category + limit + month" />
        <form onSubmit={save} className="inline-form">
          <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="field field-narrow" />
          <input type="number" placeholder="Limit" value={form.limit} onChange={e => setForm({ ...form, limit: e.target.value })} className="field field-narrow" />
          <button className="btn-primary">Set budget</button>
        </form>
      </Card>
      {items.length === 0 && <div className="gap-top"><Empty icon="Target" title={`No budgets for ${month}`} sub="Try Food 5000 / Shopping 4000 / Transport 2000 — then add transactions to see bars fill." /></div>}
      <div className="stagger gap-top duo-grid">
        {items.map((b, i) => {
          const lim = Number(b.limit ?? b.amount ?? 0); const pct = Math.min(130, Number(b.pct) || 0);
          return (
            <div key={b.id} className={`glass card-hover anim-pop budget-card ${b.over ? 'over-glow' : ''}`} style={{ animationDelay: `${i * 70}ms` }}>
              <div className="budget-top">
                <p className="font-display budget-name">{b.categoryName || b.category}</p>
                <span className={`chip ${b.over ? 'chip-expense' : 'chip-income'}`}>{b.over ? 'over' : `${Math.round(pct)}%`}</span>
              </div>
              <p className="budget-amt">{inr(b.spent)} <span className="cell-dim">/ {inr(lim)}</span></p>
              <div className="progress-track bar-gap"><div className={`progress-fill ${b.over ? 'over' : ''}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
              <div className="budget-foot">
                <span className="pager-info">{inr(Math.max(0, lim - Number(b.spent)))} left</span>
                <button className="btn-danger" onClick={() => del(b.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
