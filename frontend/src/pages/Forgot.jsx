import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import AuthShell, { AuthField, AuthError, SIDE } from '../components/AuthShell';
export default function Forgot() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState('email');
  const [msg, setMsg] = useState(''); const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const submit = async (e) => {
    e.preventDefault(); setMsg(''); setBusy(true);
    try {
      if (step === 'email') {
        const { data } = await api.post('/auth/forgotpassword', { email });
        setMsg(data.message); setStep('code');
      } else {
        const { data } = await api.post('/auth/verify-reset-code', { email, code });
        nav(`/reset?token=${encodeURIComponent(data.resetToken)}`);
      }
    } catch (e) { setMsg(e.response?.data?.message || 'Unable to process the request'); } finally { setBusy(false); }
  };
  return (
    <AuthShell title="Forgot password" sub={step === 'email' ? 'We will send a verification code to your registered email.' : 'Enter the six-digit code sent to your email.'} side={SIDE}>
      <form onSubmit={submit}>
        <AuthError msg={msg} />
        {step === 'email' ? <AuthField label="Email" type="email" required placeholder="you@mail.com" value={email} onChange={e => setEmail(e.target.value)} /> : <AuthField label="Verification code" inputMode="numeric" maxLength={6} required placeholder="6-digit code" value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} />}
        <button className="btn-primary btn-full" disabled={busy}>{busy ? 'Please wait...' : step === 'email' ? 'Send verification code' : 'Verify code'}</button>
        <p className="auth-footer"><Link to="/login" className="link">Back to login</Link>{step === 'code' && <> <span className="cell-dim">-</span> <button type="button" className="link link-button" onClick={() => { setStep('email'); setMsg(''); }}>Use another email</button></>}</p>
      </form>
    </AuthShell>
  );
}
