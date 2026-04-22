import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import './AuthPages.css';

const RegisterPage = () => {
  const [form, setForm] = useState({
    playerName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.playerName || !form.email || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({
        playerName: form.playerName,
        email: form.email,
        password: form.password,
      });
      setSuccess('Account created! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <h1 className="auth-title auth-title--green">FunGame</h1>
          <p className="auth-subtitle">Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error   && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="auth-field">
            <label>Username</label>
            <input
              type="text"
              name="playerName"
              placeholder="Choose a username"
              value={form.playerName}
              onChange={handleChange}
              className="auth-input"
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password"
              value={form.password}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          <div className="auth-field">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="auth-input"
            />
          </div>

          <button
            type="submit"
            className="auth-btn auth-btn--green"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link--blue">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;