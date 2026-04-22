import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { startGame } from '../services/api';
import Navbar from '../components/Navbar';
import './HomePage.css';

const GAMES = [
  { id: 'g-2048-0001', name: '2048',        emoji: '🎲', color: '#3185FC', textColor: '#3185FC' },
  { id: 'g-nono-0004', name: 'Nonogram',    emoji: '🎨', color: '#57A773', textColor: '#57A773' },
  { id: 'g-snak-0005', name: 'Snake',       emoji: '🐍', color: '#D16014', textColor: '#D16014' },
  { id: 'g-word-0006', name: 'Wordle',      emoji: '📝', color: '#F5B700', textColor: '#c49000' },
  { id: 'g-sudo-0002', name: 'Sudoku',      emoji: '🔢', color: '#3185FC', textColor: '#3185FC' },
  { id: 'g-mine-0003', name: 'Minesweeper', emoji: '💣', color: '#57A773', textColor: '#57A773' },
];

const DIFFICULTIES = [
  { label: 'Easy',            value: 'easy',    emoji: '🟢', color: '#57A773' },
  { label: 'Medium',         value: 'medium',  emoji: '🟡', color: '#3185FC' },
  { label: 'Hard',           value: 'hard',    emoji: '🔴', color: '#D16014' },
  { label: 'Daily Challenge', value: 'daily',  emoji: '⭐', color: '#F5B700' },
];

const HomePage = () => {
  const { player } = useAuth();
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePlayNow = (game) => setSelectedGame(game);
  const handleCancel  = () => setSelectedGame(null);

  const handleSelectDifficulty = async (difficulty) => {
    if (difficulty === 'daily') {
      // Daily challenge — use medium difficulty for now
      handleStartGame(selectedGame, 'medium', true);
      return;
    }
    handleStartGame(selectedGame, difficulty, false);
  };

  const handleStartGame = async (game, difficulty, isDaily) => {
    setLoading(true);
    try {
      const res = await startGame({ gameId: game.id, difficulty });
      const sessionId = res.data.session.session_id;
      setSelectedGame(null);
      navigate(`/game/${game.name.toLowerCase()}`, {
        state: { sessionId, difficulty, gameId: game.id, gameName: game.name, isDaily }
      });
    } catch (err) {
      console.error(err);
      alert('Failed to start game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-bg">
      <Navbar />

      <div className="home-content">
        <div className="home-welcome">
          <h1>Welcome, {player?.playerName}! 👋</h1>
          <p>Choose a game to start playing</p>
        </div>

        <div className="games-grid">
          {GAMES.map((game, i) => (
            <div
              key={game.id}
              className="game-card"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className="game-card__emoji">{game.emoji}</div>
              <div className="game-card__name" style={{ color: game.textColor }}>
                {game.name}
              </div>
              <button
                className="game-card__btn"
                style={{ background: game.color }}
                onClick={() => handlePlayNow(game)}
              >
                Play Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Difficulty Modal */}
      {selectedGame && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-game-emoji">{selectedGame.emoji}</div>
            <h2 className="modal-game-name" style={{ color: selectedGame.textColor }}>
              {selectedGame.name}
            </h2>
            <p className="modal-subtitle">Select Difficulty</p>

            <div className="modal-options">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d.value}
                  className="modal-btn"
                  style={{ background: d.color }}
                  onClick={() => handleSelectDifficulty(d.value)}
                  disabled={loading}
                >
                  {d.emoji} {d.label}
                </button>
              ))}
            </div>

            <button className="modal-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;