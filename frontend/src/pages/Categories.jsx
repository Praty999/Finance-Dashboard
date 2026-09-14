import { useEffect, useState } from 'react';
import api from '../api';
import { PageHeader, Card, SectionTitle, Empty } from '../components/ui';
export default function Categories() {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name: '', type: 'expense' });
  const load = () => api.get('/categories').then(r => setCats(r.data));
  useEffect(() => { load(); }, []);
  const add = async (e) => {
    e.preventDefault();
    await api.post('/categories', form); setForm({ name: '', type: 'expense' }); load();
  };
  const del = async (id) => { await api.delete(`/categories/${id}`); load(); };
  const inc = cats.filter(c => c.type === 'income'); const exp = cats.filter(c => c.type === 'expense');
  const pill = (c) => (
    <span key={c.id} className="anim-pop cat-pill">
      <span className="cat-dot">{c.type === 'income' ? '+' : '-'}</span> {c.name}
      {!c.isDefault && <button onClick={() => del(c.id)} className="cat-x">x</button>}
    </span>
  );
  return (
    <div className="page">
      <PageHeader eyebrow="Taxonomy" title="Categories" sub="Per-user income/expense taxonomy. New users auto-seed 12 defaults on register."
        right={<form onSubmit={add} className="glass cat-form">
          <input placeholder="New category" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="field field-narrow" />
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="field field-auto"><option value="income">Income</option><option value="expense">Expense</option></select>
          <button className="btn-primary btn-sm">+ Add</button>
        </form>} />
      <div className="stagger duo-grid">
        <Card><SectionTitle icon="$" title={`Income - ${inc.length}`} sub="Salary, Freelance, Scholarship, Other" />
          {inc.length ? <div className="pill-wrap">{inc.map(pill)}</div> : <Empty title="No income categories" sub="Add one above." />}</Card>
        <Card delay={120}><SectionTitle icon="-" title={`Expenses - ${exp.length}`} sub="Food, Transport, Shopping" />
          {exp.length ? <div className="pill-wrap">{exp.map(pill)}</div> : <Empty title="No expense categories" sub="Add one above." />}</Card>
      </div>
    </div>
  );
}
