import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { logoutPlayer } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutPlayer();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-logo">🎮</span>
        <span className="navbar-title">FunGame</span>
      </Link>
      <div className="navbar-actions">
        <Link to="/leaderboard" className="navbar-link navbar-link--orange">
          🏆 Leaderboard
        </Link>
        <Link to="/profile" className="navbar-link navbar-link--gray">
          👤 Profile
        </Link>
        <button onClick={handleLogout} className="navbar-logout">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;