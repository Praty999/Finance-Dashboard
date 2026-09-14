import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Protected from './components/Protected';
import Login from './pages/Login';
import Register from './pages/Register';
import Forgot from './pages/Forgot';
import Reset from './pages/Reset';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Recurring from './pages/Recurring';
import Categories from './pages/Categories';

export default function App() {
  return (
    <BrowserRouter><AuthProvider>
      <div className="app-shell">
        <div className="app-bg" />
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
        <Navbar />
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route path="/reset" element={<Reset />} />
            <Route path="/reset-password/:token" element={<Reset />} />
            <Route path="/" element={<Protected><Dashboard /></Protected>} />
            <Route path="/transactions" element={<Protected><Transactions /></Protected>} />
            <Route path="/budgets" element={<Protected><Budgets /></Protected>} />
            <Route path="/recurring" element={<Protected><Recurring /></Protected>} />
            <Route path="/categories" element={<Protected><Categories /></Protected>} />
          </Routes>
        </main>
      </div>
    </AuthProvider></BrowserRouter>
  );
}

