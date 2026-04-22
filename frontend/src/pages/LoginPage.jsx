import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginPlayer } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await login({ email: form.email, password: form.password });
      loginPlayer(res.data.player, res.data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Logo + Title */}
        <div className="auth-header">
          <span className="auth-logo"></span>
          <h1 className="auth-title">FunGame</h1>
          <p className="auth-subtitle">Login to start playing</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="text"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="auth-input"
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn--blue"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link--green">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;