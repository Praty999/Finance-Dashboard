import { useEffect, useState } from 'react';
import api, { inr } from '../api';
import { PageHeader, Card, SectionTitle, Empty } from '../components/ui';
const PM = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'NetBanking', 'Wallet', 'Other'];
export default function Transactions() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [cats, setCats] = useState([]);
  const [f, setF] = useState({ search: '', type: '', category: '', from: '', to: '', page: 1 });
  const [form, setForm] = useState({ type: 'expense', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), description: '', paymentMethod: 'UPI' });
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const formCats = cats.filter((category) => category.type === form.type);

  const load = async () => {
    const params = { ...f, limit: 10 };
    Object.keys(params).forEach(k => !params[k] && delete params[k]);
    const { data } = await api.get('/transactions', { params });
    setItems(data.items); setTotal(data.total);
  };
  useEffect(() => { api.get('/categories').then(r => setCats(r.data)); }, []);
  useEffect(() => {
    if (formCats.length && !formCats.some((category) => category.name === form.category)) {
      setForm((current) => ({ ...current, category: formCats[0].name }));
    }
  }, [form.type, cats]);
  useEffect(() => { load(); }, [f.page]);
  const search = (e) => { e.preventDefault(); setF({ ...f, page: 1 }); load(); };
  const submit = async (e) => {
    e.preventDefault();
    if (editing) { await api.put(`/transactions/${editing}`, form); setEditing(null); }
    else await api.post('/transactions', form);
    setForm({ type: 'expense', amount: '', category: 'Food', date: new Date().toISOString().slice(0, 10), description: '', paymentMethod: 'UPI' });
    setShowAdd(false); load();
  };
  const del = async (id) => { if (confirm('Delete?')) { await api.delete(`/transactions/${id}`); load(); } };
  const edit = (t) => { setEditing(t.id); setShowAdd(true); setForm({ type: t.type, amount: t.amount, category: t.categoryName || t.category, date: String(t.date).slice(0, 10), description: t.description, paymentMethod: t.paymentMethod }); };

  return (
    <div className="page">
      <PageHeader eyebrow="Ledger" title="Transactions" sub={`Paginated search + filters • ${total} records`}
        right={<button className="btn-primary" onClick={() => setShowAdd(true)}>+ New transaction</button>} />
      <Card delay={60}>
        <form onSubmit={search} className="filter-grid">
          <input placeholder="Search…" value={f.search} onChange={e => setF({ ...f, search: e.target.value })} className="field search-span" />
          <select value={f.type} onChange={e => setF({ ...f, type: e.target.value })} className="field"><option value="">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>
          <select value={f.category} onChange={e => setF({ ...f, category: e.target.value })} className="field"><option value="">All categories</option>{cats.map((c) => <option key={`${c.type}-${c.id}`} value={c.name}>{c.name} ({c.type})</option>)}</select>
          <input type="date" value={f.from} onChange={e => setF({ ...f, from: e.target.value })} className="field" />
          <div className="filter-dates"><input type="date" value={f.to} onChange={e => setF({ ...f, to: e.target.value })} className="field" /><button className="btn-primary btn-sm">Go</button></div>
        </form>
      </Card>
      <Card className="gap-top card-flat" delay={140}>
        <div className="scroll-x">
          <table className="tbl">
            <thead><tr className="tbl-head">
              <th className="cell">Date</th><th className="cell">Type</th><th className="cell">Category</th><th className="cell">Amount</th><th className="cell">Note</th><th className="cell">Pay</th><th className="cell cell-right">Actions</th>
            </tr></thead>
            <tbody>{items.map(t => (
              <tr key={t.id} className="anim-pop tbl-row">
                <td className="cell cell-dim nowrap">{String(t.date).slice(0, 10)}</td>
                <td className="cell"><span className={`chip ${t.type === 'income' ? 'chip-income' : 'chip-expense'}`}>{t.type === 'income' ? 'in' : 'out'}</span></td>
                <td className="cell cell-strong">{t.categoryName || t.category}</td>
                <td className={`cell cell-amt ${t.type === 'income' ? 'amt-in' : 'amt-out'}`}>{inr(t.amount)}</td>
                <td className="cell cell-dim note-cell">{t.description || '—'}</td>
                <td className="cell cell-dim">{t.paymentMethod}</td>
                <td className="cell cell-right nowrap"><button className="btn-ghost btn-xs" onClick={() => edit(t)}>Edit</button> <button className="btn-danger" onClick={() => del(t.id)}>Del</button></td>
              </tr>))}</tbody>
          </table>
        </div>
        {!items.length && <div className="empty-pad"><Empty icon="No data" title="No transactions" sub="Adjust filters or add your first transaction." /></div>}
        <div className="pager">
          <button className="btn-ghost btn-sm" disabled={f.page <= 1} onClick={() => setF({ ...f, page: f.page - 1 })}>Prev</button>
          <span className="pager-info">Page {f.page} • {total} total</span>
          <button className="btn-ghost btn-sm" onClick={() => setF({ ...f, page: f.page + 1 })}>Next</button>
        </div>
      </Card>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => { setShowAdd(false); setEditing(null); }}>
          <div className="modal-card glass modal-pad" onClick={e => e.stopPropagation()}>
            <SectionTitle icon="+" title={editing ? 'Edit transaction' : 'New transaction'} sub="Keep every entry organized" />
            <form onSubmit={submit} className="modal-form">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="field"><option value="income">Income</option><option value="expense">Expense</option></select>
              <input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required className="field" />
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="field field-span">{formCats.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required className="field" />
              <input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="field field-span" />
              <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="field">{PM.map(p => <option key={p} value={p}>{p}</option>)}</select>
              <div className="modal-actions"><button className="btn-primary modal-grow">{editing ? 'Update' : 'Add'}</button><button type="button" className="btn-ghost" onClick={() => { setShowAdd(false); setEditing(null); }}>Cancel</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
