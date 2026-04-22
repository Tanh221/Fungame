import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getHistory, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProfilePage.css';

const GAME_COLORS = {
  '2048':        '#3185FC',
  'Sudoku':      '#3185FC',
  'Nonogram':    '#57A773',
  'Snake':       '#D16014',
  'Wordle':      '#c49000',
  'Minesweeper': '#57A773',
};

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });
};

// STATUS column: Done or Resume button
const StatusCell = ({ row, onResume }) => {
  if (row.state === 'PAUSED') {
    return (
      <button className="prof-resume-btn" onClick={() => onResume(row)}>
        ▶ Resume
      </button>
    );
  }
  return <span className="prof-state-badge prof-state-badge--done">✓ Done</span>;
};

// RESULT column: Win / Loss / Pending
const ResultCell = ({ row }) => {
  if (row.state === 'PAUSED') {
    return <span className="prof-result-badge prof-result-badge--pending">⏳ Pending</span>;
  }
  if (row.result === 'win') {
    return <span className="prof-result-badge prof-result-badge--win">🏆 Win</span>;
  }
  if (row.result === 'loss') {
    return <span className="prof-result-badge prof-result-badge--loss">💀 Loss</span>;
  }
  // Old records without result field
  return <span className="prof-result-badge prof-result-badge--neutral">—</span>;
};

const ProfilePage = () => {
  const { player, loginPlayer } = useAuth();
  const navigate = useNavigate();

  const [profile,   setProfile]   = useState(null);
  const [history,   setHistory]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(false);
  const [editForm,  setEditForm]  = useState({ playerName: '', gender: '' });
  const [saving,    setSaving]    = useState(false);
  const [editError, setEditError] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profRes, histRes] = await Promise.all([getProfile(), getHistory()]);
      setProfile(profRes.data);
      setHistory(histRes.data);
      setEditForm({
        playerName: profRes.data.player_name || '',
        gender:     profRes.data.gender      || '',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm.playerName.trim()) { setEditError('Username cannot be empty.'); return; }
    setSaving(true);
    try {
      await updateProfile(editForm);
      loginPlayer({ ...player, playerName: editForm.playerName }, localStorage.getItem('token'));
      setProfile((p) => ({ ...p, player_name: editForm.playerName, gender: editForm.gender }));
      setEditing(false);
      setEditError('');
    } catch (e) {
      setEditError('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleResume = (row) => {
    navigate(`/game/${row.game_type.toLowerCase()}`, {
      state: {
        sessionId:    row.session_id,
        difficulty:   row.difficulty,
        gameId:       row.game_id,
        gameName:     row.game_type,
        isDaily:      false,
        resumedScore: row.score,
        isResumed:    true,
      }
    });
  };

  const winRate = () => {
  const wins = history.filter(g => g.result === 'win').length;
  const totalFinished = history.filter(g => g.state === 'FINISHED').length;

  if (totalFinished === 0) return 0;
  return Math.round((wins / totalFinished) * 100);
};

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : '—';

  if (loading) {
    return (
      <div className="prof-bg">
        <nav className="prof-navbar">
          <div className="prof-navbar__brand"><span>🎮</span><span className="prof-navbar__title">FunGame</span></div>
        </nav>
        <div className="prof-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="prof-bg">
      <nav className="prof-navbar">
        <div className="prof-navbar__brand"><span>🎮</span><span className="prof-navbar__title">FunGame</span></div>
        <button className="prof-back-btn" onClick={() => navigate('/')}>← Back</button>
      </nav>

      <div className="prof-content">

        {/* Profile Card */}
        <div className="prof-card">
          <div className="prof-card__top">
            <div className="prof-avatar">
              {profile?.player_name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="prof-info">
              {editing ? (
                <div className="prof-edit-form">
                  <div className="prof-edit-field">
                    <label className="prof-edit-label">Username</label>
                    <input
                      className="prof-edit-input"
                      value={editForm.playerName}
                      onChange={(e) => setEditForm({ ...editForm, playerName: e.target.value })}
                    />
                  </div>
                  <div className="prof-edit-field">
                    <label className="prof-edit-label">Gender</label>
                    <select
                      className="prof-edit-input"
                      value={editForm.gender}
                      onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  {editError && <p className="prof-edit-error">{editError}</p>}
                </div>
              ) : (
                <>
                  <h2 className="prof-name">{profile?.player_name}</h2>
                  <p className="prof-email">{profile?.email}</p>
                  {profile?.gender && <p className="prof-gender">{profile.gender}</p>}
                  <p className="prof-since">Member since {memberSince}</p>
                </>
              )}
            </div>
            <div className="prof-card__actions">
              {editing ? (
                <>
                  <button className="prof-save-btn" onClick={handleSaveProfile} disabled={saving}>
                    💾 {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button className="prof-cancel-btn" onClick={() => { setEditing(false); setEditError(''); }}>
                    ✕ Cancel
                  </button>
                </>
              ) : (
                <button className="prof-edit-btn" onClick={() => setEditing(true)}>✏️ Edit Profile</button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="prof-stats">
            <div className="prof-stat">
              <span className="prof-stat__icon">🎮</span>
              <span className="prof-stat__value" style={{ color: '#3185FC' }}>{profile?.total_games_played ?? 0}</span>
              <span className="prof-stat__label">Total Games</span>
            </div>
            <div className="prof-stat">
              <span className="prof-stat__icon">⭐</span>
              <span className="prof-stat__value" style={{ color: '#F5B700' }}>{(profile?.highest_score_ever ?? 0).toLocaleString()}</span>
              <span className="prof-stat__label">Best Score</span>
            </div>
            <div className="prof-stat">
              <span className="prof-stat__icon">🏆</span>
              <span className="prof-stat__value" style={{ color: '#57A773' }}>{profile?.games_finished ?? 0}</span>
              <span className="prof-stat__label">Completed</span>
            </div>
            <div className="prof-stat">
              <span className="prof-stat__icon">🔥</span>
              <span className="prof-stat__value" style={{ color: '#D16014' }}>{winRate()}%</span>
              <span className="prof-stat__label">Win Rate</span>
            </div>
          </div>
        </div>

        {/* Game History */}
        <div className="prof-history-card">
          <h3 className="prof-section-title">📋 Game History</h3>
          {history.length === 0 ? (
            <div className="prof-empty">
              No games played yet.{' '}
              <span onClick={() => navigate('/')} className="prof-play-link">Start playing!</span>
            </div>
          ) : (
            <table className="prof-table">
              <thead>
                <tr className="prof-table__head">
                  <th className="prof-th">Game</th>
                  <th className="prof-th">Difficulty</th>
                  <th className="prof-th">Score</th>
                  <th className="prof-th">Time Used</th>
                  <th className="prof-th">Date</th>
                  <th className="prof-th">Status</th>
                  <th className="prof-th">Result</th>
                </tr>
              </thead>
              <tbody>
                {history.map((row, i) => (
                  <tr
                    key={i}
                    className={`prof-table__row ${row.state === 'PAUSED' ? 'prof-table__row--paused' : ''}`}
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <td className="prof-td">
                      <span className="prof-game-name" style={{ color: GAME_COLORS[row.game_type] || '#3185FC' }}>
                        {row.game_type}
                      </span>
                    </td>
                    <td className="prof-td">
                      <span className={`prof-diff-badge prof-diff-badge--${row.difficulty}`}>
                        {row.difficulty}
                      </span>
                    </td>
                    <td className="prof-td prof-score">{(row.score ?? 0).toLocaleString()}</td>
                    <td className="prof-td prof-time">{formatTime(row.time_seconds)}</td>
                    <td className="prof-td prof-date">{formatDate(row.end_time ?? row.start_time)}</td>
                    <td className="prof-td">
                      <StatusCell row={row} onResume={handleResume} />
                    </td>
                    <td className="prof-td">
                      <ResultCell row={row} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;