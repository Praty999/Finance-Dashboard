import { useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import AuthShell, { AuthField, SIDE } from '../components/AuthShell';
export default function Reset() {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState(paramToken || searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    try {
      if (!token) { setMsg('Your reset session is missing or invalid.'); return; }
      await api.put(`/auth/resetpassword/${token}`, { password });
      setMsg('Reset successful! Redirecting to login...');
      setTimeout(() => nav('/login'), 1200);
    } catch (e) { setMsg(e.response?.data?.message || 'Failed'); }
  };
  return (
    <AuthShell title="Set a new password" sub="Choose a new password for your FinanceDash account." side={SIDE}>
      <form onSubmit={submit}>
        {!paramToken && !searchParams.get('token') && <AuthField label="Reset token" required placeholder="paste token" value={token} onChange={e => setToken(e.target.value)} />}
        <AuthField label="New password" type="password" required minLength={6} placeholder="Min 6 chars" value={password} onChange={e => setPassword(e.target.value)} />
        <button className="btn-primary btn-full">Reset</button>
        {msg && <p className="auth-msg">{msg}</p>}
        <p className="auth-footer"><Link to="/login" className="link">Login</Link></p>
      </form>
    </AuthShell>
  );
}
