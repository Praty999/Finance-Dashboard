import { useEffect, useState } from 'react';
import api, { inr } from '../api';
import { PageHeader, Card, SectionTitle, Empty } from '../components/ui';
export default function Recurring() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', amount: '', type: 'expense', category: 'Bills', frequency: 'Monthly', nextDue: '', paymentMethod: 'UPI' });
  const load = () => api.get('/recurring').then(r => setItems(r.data));
  useEffect(() => { load(); }, []);
  const add = async (e) => { e.preventDefault(); await api.post('/recurring', form); setForm({ title: '', amount: '', type: 'expense', category: 'Bills', frequency: 'Monthly', nextDue: '', paymentMethod: 'UPI' }); load(); };
  const del = async (id) => { await api.delete(`/recurring/${id}`); load(); };
  const monthlyLoad = items.filter(i => i.frequency === 'Monthly' && i.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
  const dueSoon = items.filter(i => new Date(i.nextDue) - Date.now() < 7 * 864e5).length;
  const FREQ_ICON = { Weekly: 'W', Monthly: 'M', Quarterly: 'Q', Yearly: 'Y' };
  return (
    <div className="page">
      <PageHeader eyebrow="Autopilot" title="Recurring" sub="Subscriptions + salary schedules. Monthly burn previewed below." />
      <div className="stagger trio-grid">
        <div className="glass mini-card"><p className="mini-label">Active plans</p><p className="font-display mini-big">{items.length}</p></div>
        <div className="glass mini-card"><p className="mini-label">Monthly outflow</p><p className="font-display mini-big amt-out">{inr(monthlyLoad)}</p></div>
        <div className="glass mini-card"><p className="mini-label">Due in 7 days</p><p className="font-display mini-big amt-warn">{dueSoon}</p></div>
      </div>
      <Card className="gap-top" delay={120}>
        <SectionTitle icon="+" title="New schedule" sub="Title, amount, frequency, next due" />
        <form onSubmit={add} className="recur-form">
          <input placeholder="Title e.g. Netflix" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="field" />
          <input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="field" />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="field"><option value="expense">Expense</option><option value="income">Income</option></select>
          <input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="field" />
          <select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} className="field"><option>Weekly</option><option>Monthly</option><option>Quarterly</option><option>Yearly</option></select>
          <input type="date" value={form.nextDue} onChange={e => setForm({ ...form, nextDue: e.target.value })} required className="field" />
          <button className="btn-primary">Add</button>
        </form>
      </Card>
      <div className="stagger gap-top recur-grid">
        {items.map((r, i) => (
          <div key={r.id} className="glass card-hover anim-pop recur-card" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="budget-top">
              <span className="recur-ico">{FREQ_ICON[r.frequency] || 'R'}</span>
              <span className={`chip ${r.type === 'income' ? 'chip-income' : 'chip-expense'}`}>{r.frequency}</span>
            </div>
            <p className="font-display recur-title">{r.title}</p>
            <p className={`font-display recur-amt ${r.type === 'income' ? 'amt-in' : 'amt-out'}`}>{inr(r.amount)}</p>
            <p className="pager-info gap-top-sm">Next due {String(r.nextDue)?.slice(0, 10)} • {r.categoryName || r.category}</p>
            <button className="btn-danger gap-top-sm" onClick={() => del(r.id)}>Delete</button>
          </div>
        ))}
      </div>
      {!items.length && <div className="gap-top"><Empty icon="Repeat" title="No recurring plans" sub="Add Netflix, rent, salary… and monthly load computes automatically." /></div>}
    </div>
  );
}
