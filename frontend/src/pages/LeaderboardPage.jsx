import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './LeaderboardPage.css';

const GAMES = [
  { label: '2048',        value: '2048',        emoji: '🎲' },
  { label: 'Nonogram',    value: 'Nonogram',    emoji: '🎨' },
  { label: 'Snake',       value: 'Snake',       emoji: '🐍' },
  { label: 'Wordle',      value: 'Wordle',      emoji: '📝' },
  { label: 'Sudoku',      value: 'Sudoku',      emoji: '🔢' },
  { label: 'Minesweeper', value: 'Minesweeper', emoji: '💣' },
];

const MEDAL      = ['🥇', '🥈', '🥉'];
const RANK_COLORS = ['#F5B700', '#aaa', '#cd7f32'];

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
};

const LeaderboardPage = () => {
  const { player } = useAuth();
  const navigate   = useNavigate();

  const [selectedGame, setSelectedGame] = useState(GAMES[0]);
  const [difficulty,   setDifficulty]   = useState('medium');
  const [data,         setData]         = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [dropOpen,     setDropOpen]     = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGame, difficulty]);

  useEffect(() => {
    const handle = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getLeaderboard(selectedGame.value, difficulty);
      setData(res.data);
    } catch (e) {
      console.error(e);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const isMe = (row) => row.player_name === player?.playerName;

  const handleSelectGame = (game) => { setSelectedGame(game); setDropOpen(false); };

  return (
    <div className="lb-bg">
      <nav className="lb-navbar">
        <div className="lb-navbar__brand"><span>🎮</span><span className="lb-navbar__title">FunGame</span></div>
        <button className="lb-back-btn" onClick={() => navigate('/')}>← Back</button>
      </nav>

      <div className="lb-content">
        <div className="lb-header">
          <span className="lb-trophy">🏆</span>
          <h1 className="lb-title">Leaderboard</h1>
          <p className="lb-subtitle">Top players this season</p>
        </div>

        {/* Filters */}
        <div className="lb-filters">
          {/* Game Dropdown */}
          <div className="lb-dropdown" ref={dropRef}>
            <button className="lb-dropdown__btn" onClick={() => setDropOpen((o) => !o)}>
              <span>{selectedGame.emoji} {selectedGame.label}</span>
              <span className="lb-dropdown__arrow">{dropOpen ? '▲' : '▼'}</span>
            </button>
            {dropOpen && (
              <div className="lb-dropdown__menu">
                {GAMES.map((g) => (
                  <button
                    key={g.value}
                    className={`lb-dropdown__item ${selectedGame.value === g.value ? 'lb-dropdown__item--active' : ''}`}
                    onClick={() => handleSelectGame(g)}
                  >
                    <span className="lb-dropdown__item-emoji">{g.emoji}</span>
                    {g.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Difficulty */}
          <div className="lb-difficulty-tabs">
            {['easy', 'medium', 'hard'].map((d) => (
              <button
                key={d}
                className={`lb-diff-btn lb-diff-btn--${d} ${difficulty === d ? 'lb-diff-btn--active' : ''}`}
                onClick={() => setDifficulty(d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="lb-table-wrapper">
          <table className="lb-table">
            <thead>
              <tr className="lb-table__head">
                <th className="lb-th">Rank</th>
                <th className="lb-th">Player</th>
                <th className="lb-th">Score</th>
                <th className="lb-th">Time Used</th>
                <th className="lb-th">Games Played</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="lb-empty">Loading...</td></tr>
              ) : data.length === 0 ? (
                <tr><td colSpan={5} className="lb-empty">No data yet. Be the first to play! 🎮</td></tr>
              ) : (
                data.map((row, i) => (
                  <tr key={i} className={`lb-table__row ${isMe(row) ? 'lb-table__row--you' : ''}`}>
                    <td className="lb-td lb-rank-cell">
                      {i < 3 ? MEDAL[i] : '🏅'}&nbsp;
                      <span style={{ color: i < 3 ? RANK_COLORS[i] : '#3185FC', fontWeight: 800 }}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="lb-td lb-player-cell">
                      {row.player_name}
                      {isMe(row) && <span className="lb-you-badge">You</span>}
                    </td>
                    <td className="lb-td lb-score-cell">
                      {(row.best_score ?? row.score ?? 0).toLocaleString()}
                    </td>
                    <td className="lb-td lb-time-cell">
                      {formatTime(row.best_time_seconds ?? row.time_seconds)}
                    </td>
                    <td className="lb-td lb-games-cell">— games</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;