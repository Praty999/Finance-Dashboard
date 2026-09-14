import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthShell, { AuthField, AuthError, AuthFooter, SIDE } from '../components/AuthShell';
export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [code, setCode] = useState('');
  const [step, setStep] = useState('form');
  const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const { register, verifyEmail } = useAuth(); const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      if (step === 'form') {
        await register(form.name, form.email, form.password);
        setStep('verify');
      } else {
        await verifyEmail(form.email, code);
        nav('/');
      }
    }
    catch (e) { setErr(e.response?.data?.errors?.[0]?.msg || e.response?.data?.message || 'Failed'); }
    finally { setBusy(false); }
  };
  return (
    <AuthShell title={step === 'form' ? 'Create account' : 'Verify your email'} sub={step === 'form' ? 'We will send a verification code before your account is activated.' : `Enter the six-digit code sent to ${form.email}.`} side={SIDE}>
      <form onSubmit={submit}>
        <AuthError msg={err} />
        {step === 'form' ? <>
          <AuthField label="Name" required placeholder="Aarav Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <AuthField label="Email" type="email" required placeholder="you@mail.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <AuthField label="Password" type="password" required minLength={6} placeholder="Min 6 chars" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </> : <AuthField label="Verification code" inputMode="numeric" maxLength={6} required placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />}
        <button className="btn-primary btn-full" disabled={busy}>{busy ? 'Please wait...' : step === 'form' ? 'Send verification code' : 'Verify email and continue'}</button>
        <AuthFooter><Link to="/login" className="link">Already have an account? Login</Link></AuthFooter>
      </form>
    </AuthShell>
  );
}
