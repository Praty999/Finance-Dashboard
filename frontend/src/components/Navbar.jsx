import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LINKS = [
  { to: '/', label: 'Dashboard', icon: '📊', end: true },
  { to: '/transactions', label: 'Transactions', icon: '🧾' },
  { to: '/budgets', label: 'Budgets', icon: '🎯' },
  { to: '/recurring', label: 'Recurring', icon: '🔁' },
  { to: '/categories', label: 'Categories', icon: '🏷️' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="nav-shell">
      <div className="nav-inner">
        <Link to="/" className="brand-link">
          <span className="brand-badge">💰</span>
          <span>
            <span className="font-display brand-name">FinanceDash</span>
            <span className="brand-sub">Your money, clearly seen</span>
          </span>
        </Link>

        {user ? (
          <>
            <nav className="menu-desktop">
              {LINKS.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end}
                  className={({ isActive }) => (isActive ? 'menu-link-active' : 'menu-link')}>
                  <span className="menu-ico">{l.icon}</span>{l.label}
                </NavLink>
              ))}
            </nav>
            <div className="menu-desktop menu-user">
              <span className="chip">👋 {user.name ? user.name.split(' ')[0] : 'there'}</span>
              <button onClick={() => { logout(); nav('/login'); }} className="btn-ghost btn-sm">Logout</button>
            </div>
            <button className="btn-ghost btn-sm menu-burger" onClick={() => setOpen(!open)}>{open ? '✕' : '☰'}</button>
          </>
        ) : (
          <div className="menu-auth">
            <Link to="/login" className="menu-link">Login</Link>
            <Link to="/register" className="btn-primary btn-sm">Get started →</Link>
          </div>
        )}
      </div>

      {user && open && (
        <div className="anim-pop menu-mobile">
          <div className="menu-mobile-list">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}
                className={({ isActive }) => (isActive ? 'menu-link-active' : 'menu-link')}>
                {l.icon} {l.label}
              </NavLink>
            ))}
            <button onClick={() => { logout(); nav('/login'); }} className="btn-ghost btn-sm">Logout ({user.name})</button>
          </div>
        </div>
      )}
    </header>
  );
}

