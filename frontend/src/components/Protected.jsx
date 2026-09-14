import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="page">
      <div className="trio-grid">
        {[0, 1, 2].map(i => <div key={i} className="skeleton skel-pad"><div className="shimmer skeleton-bar skel-w1" /><div className="shimmer skeleton-bar skel-load" /></div>)}
      </div>
      <div className="skeleton skel-hero"><div className="shimmer shimmer-full" /></div>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

