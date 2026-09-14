import { useEffect, useState } from 'react';

const AUTH_IMAGES = [
  'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1554224154-22dec7ec8818?auto=format&fit=crop&w=1200&q=85',
  'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=85',
];

export default function AuthShell({ title, sub, children, side }) {
  const [imageIndex, setImageIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setImageIndex((current) => (current + 1) % AUTH_IMAGES.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="page">
      <div className="anim-page auth-grid">
        <div className="auth-side">
          <div className="auth-image-carousel" aria-label="Finance dashboard imagery">
            {AUTH_IMAGES.map((image, index) => <img key={image} src={image} alt="" className={`auth-image ${index === imageIndex ? 'auth-image-active' : ''}`} />)}
          </div>
          <div className="auth-side-mid">
            <h2 className="font-display auth-side-title">{side?.title}</h2>
            <p className="auth-side-sub">{side?.sub}</p>
            <div className="auth-stats">
              {side?.stats?.map((s, i) => (
                <div key={i} className="auth-stat">
                  <p className="font-display auth-stat-v">{s.v}</p>
                  <p className="auth-stat-l">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="auth-main">
          <h1 className="font-display auth-title">{title}</h1>
          <p className="auth-sub">{sub}</p>
          <div className="auth-gap">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthField({ label, ...props }) {
  const [visible, setVisible] = useState(false);
  const isPassword = props.type === 'password';

  return (
    <label className="auth-field">
      <span className="auth-label">{label}</span>
      <span className={isPassword ? 'password-field' : undefined}>
        <input {...props} type={isPassword && visible ? 'text' : props.type} className="field" />
        {isPassword && <button type="button" className="password-toggle" onClick={() => setVisible((current) => !current)} aria-label={visible ? 'Hide password' : 'Show password'} title={visible ? 'Hide password' : 'Show password'}>{visible ? '◉' : '◌'}</button>}
      </span>
    </label>
  );
}

export function AuthError({ msg }) {
  if (!msg) return null;
  return <div className="anim-pop auth-err">{msg}</div>;
}

export function AuthFooter({ children }) {
  return <p className="auth-footer">{children}</p>;
}

export const SIDE = {
  title: 'Own every rupee. Visually.',
  sub: 'A calmer way to understand your spending, plan ahead and build better money habits.',
  stats: [{ v: '6M', l: 'Spending view' }, { v: 'INR', l: 'Native currency' }, { v: '24/7', l: 'Your overview' }],
};
