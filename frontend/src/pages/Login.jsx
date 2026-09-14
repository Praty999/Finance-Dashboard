import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import AuthShell, { AuthField, AuthError, AuthFooter, SIDE } from '../components/AuthShell';
export default function Login() {
  const [email, setEmail] = useState('demo@demo.com');
  const [password, setPassword] = useState('demo123');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth(); const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const { data } = await api.get('/auth/check-email', { params: { email } });
      if (!data.exists) {
        setErr('No account found with this email. Please check your email or create an account.');
        return;
      }
      await login(email, password); nav('/');
    }
    catch (e) { setErr(e.response?.data?.message || 'Login failed'); }
    finally { setBusy(false); }
  };
  return (
    <AuthShell title="Welcome back" sub="Log in to see live charts, budgets and insights." side={SIDE}>
      <form onSubmit={submit}>
        <AuthError msg={err} />
        <AuthField label="Email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@mail.com" />
        <AuthField label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
        <button className="btn-primary btn-full" disabled={busy}>{busy ? 'Logging in...' : 'Login'}</button>
        <button type="button" className="btn-ghost btn-full auth-gap-sm" onClick={() => { setEmail('demo@demo.com'); setPassword('demo123'); }}>Fill demo credentials</button>
        <AuthFooter><Link to="/forgot" className="link">Forgot password?</Link> <span className="cell-dim">-</span> <Link to="/register" className="link">New here? Register</Link></AuthFooter>
      </form>
    </AuthShell>
  );
}

