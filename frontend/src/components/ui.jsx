import { useCountUp } from '../hooks/useCountUp';
import { inr } from '../api';

export function PageHeader({ eyebrow, title, sub, right }) {
  return (
    <div className="anim-page page-head">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="font-display page-title">{title}</h1>
        {sub && <p className="page-sub">{sub}</p>}
      </div>
      {right && <div className="page-actions">{right}</div>}
    </div>
  );
}

export function StatCard({ label, value, delta, icon, tone = 'iris', delay = 0 }) {
  const animated = useCountUp(value || 0);
  const tones = {
    iris: 'tone-iris',
    mint: 'tone-mint',
    rose: 'tone-rose',
    gold: 'tone-gold',
  };
  return (
    <div className="glass card-hover anim-pop stat-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="stat-top">
        <span className={`stat-ico ${tones[tone]}`}>{icon}</span>
        {delta && <span className="chip">{delta}</span>}
      </div>
      <p className="stat-label">{label}</p>
      <p className="font-display stat-value">Rs.{animated}</p>
    </div>
  );
}

export function Card({ className = '', children, delay = 0 }) {
  return <div className={`glass card-hover anim-pop card-pad ${className}`} style={{ animationDelay: `${delay}ms` }}>{children}</div>;
}

export function SectionTitle({ icon, title, sub, right }) {
  return (
    <div className="section-head">
      <div>
        <h3 className="font-display section-title">{icon} {title}</h3>
        {sub && <p className="section-sub">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

export function Empty({ icon = 'Empty', title, sub }) {
  return (
    <div className="empty-box">
      <div className="empty-ico">{icon}</div>
      <p className="font-display empty-title">{title}</p>
      {sub && <p className="empty-sub">{sub}</p>}
    </div>
  );
}

export function SkeletonCards({ n = 3 }) {
  return (
    <div className="skel-grid">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="skeleton skel-pad">
          <div className="shimmer skeleton-bar skel-w1" />
          <div className="shimmer skeleton-bar skel-w2" />
          <div className="shimmer skeleton-bar skel-w3" />
        </div>
      ))}
    </div>
  );
}

export function SavingsRing({ pct = 0, label }) {
  const safe = Math.max(0, Math.min(100, Number(pct) || 0));
  const color = safe >= 20 ? '#10b981' : '#f59e0b';
  return (
    <div className="ring-row">
      <div className="ring-conic ring-size" style={{ ['--pct']: safe, ['--ring-color']: color }}>
        <div className="ring-inner">
          <span className="font-display ring-pct">{safe}%</span>
        </div>
      </div>
      {label && <p className="ring-label">{label}</p>}
    </div>
  );
}

export { inr };
