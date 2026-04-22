import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { finishGame, saveBoardState, getSessionById } from '../services/api';
import Game2048 from '../games/Game2048/Game2048';
import Nonogram from '../games/Nonogram/Nonogram';
import './GamePage.css';

const HINT_GAMES = ['sudoku', 'nonogram', 'minesweeper'];

const DIFFICULTY_COLORS = {
  easy:   '#57A773',
  medium: '#3185FC',
  hard:   '#D16014',
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const GamePage = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const { sessionId, difficulty, gameName, isDaily, isResumed, resumedScore } = state || {};

  const [score,        setScore]        = useState(resumedScore || 0);
  const [hints,        setHints]        = useState(3);
  const [seconds,      setSeconds]      = useState(0);
  const [paused,       setPaused]       = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [saving,       setSaving]       = useState(false);
  const [initialBoard, setInitialBoard] = useState(null);
  const [boardReady,   setBoardReady]   = useState(!isResumed);

  const timerRef  = useRef(null);
  const boardRef  = useRef(null);

  // Only show hint button for non-nonogram hint games
  // Nonogram manages its own hint button internally
  const showHintBar = HINT_GAMES.includes(gameName?.toLowerCase()) && gameName?.toLowerCase() !== 'nonogram';

  useEffect(() => {
    if (isResumed && sessionId) {
      getSessionById(sessionId)
        .then((res) => {
          if (res.data?.board_state) setInitialBoard(res.data.board_state);
          setBoardReady(true);
        })
        .catch(() => setBoardReady(true));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!paused && boardReady) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [paused, boardReady]);

  const handlePause       = () => setPaused((p) => !p);
  const handleUseHint     = () => { if (hints > 0) setHints((h) => h - 1); };
  const handleScoreChange = (s) => setScore(s);
  const handleBoardChange = (b) => { boardRef.current = b; };

  // isWin = true → Win, false → Loss
  const handleGameOver = async (finalScore, isWin) => {
    clearInterval(timerRef.current);
    const gameResult = isWin ? 'win' : 'loss';
    try {
      await finishGame({ sessionId, score: finalScore, result: gameResult });
    } catch (e) { console.error(e); }
    setResult({ score: finalScore, time: seconds, isWin });
  };

  const handleSaveProgress = async () => {
    setSaving(true);
    clearInterval(timerRef.current);
    try {
      if (boardRef.current) {
        await saveBoardState({ sessionId, boardState: boardRef.current });
      }
      await finishGame({ sessionId, score, state: 'PAUSED', result: 'pending' });
    } catch (e) { console.error(e); }
    finally { setSaving(false); navigate('/'); }
  };

  const handleExitGame = async () => {
    if (!window.confirm('Exit game? Progress will NOT be saved.')) return;
    setLoading(true);
    clearInterval(timerRef.current);
    try { await finishGame({ sessionId, score, result: 'loss' }); } catch (e) { console.error(e); }
    finally { setLoading(false); navigate('/'); }
  };

  if (!state) { navigate('/'); return null; }

  const renderGame = () => {
    if (!boardReady) return <div className="game-area__placeholder"><p>Loading saved game...</p></div>;

    switch (gameName) {
      case '2048':
        return (
          <Game2048
            difficulty={difficulty}
            initialBoard={initialBoard}
            initialScore={resumedScore || 0}
            onScoreChange={handleScoreChange}
            onBoardChange={handleBoardChange}
            onGameOver={handleGameOver}
            paused={paused}
          />
        );
      case 'Nonogram':
        return (
          <Nonogram
            difficulty={difficulty}
            onScoreChange={handleScoreChange}
            onGameOver={handleGameOver}
            onHintUsed={() => setHints(h => Math.max(0, h - 1))}
            paused={paused}
          />
        );
      default:
        return (
          <div className="game-area__placeholder">
            <span className="game-area__icon">🎯</span>
            <h3>{gameName}</h3>
            <p>Coming soon!</p>
          </div>
        );
    }
  };

  return (
    <div className="game-bg">
      <nav className="game-navbar">
        <div className="game-navbar__brand">
          <span>🎮</span>
          <span className="game-navbar__title">FunGame</span>
        </div>
        <div className="game-navbar__stats">
          <div className="stat-badge stat-badge--yellow">⏱ {formatTime(seconds)}</div>
          {showHintBar && (
            <div className="stat-badge stat-badge--green">💡 Hints: {hints}</div>
          )}
          <div className="stat-badge stat-badge--blue">⭐ Score: {score}</div>
        </div>
      </nav>

      <div className="game-content">
        <div className="game-card">
          <div className="game-card__header">
            <div className="game-card__info">
              <h2 className="game-card__title">{gameName}</h2>
              <p className="game-card__difficulty">
                Difficulty:{' '}
                <span style={{ color: DIFFICULTY_COLORS[difficulty] || '#3185FC' }}>
                  {difficulty?.charAt(0).toUpperCase() + difficulty?.slice(1)}
                  {isDaily   ? ' · Daily Challenge' : ''}
                  {isResumed ? ' · Resumed'         : ''}
                </span>
              </p>
            </div>
            <button className="game-exit-btn" onClick={handleExitGame} disabled={loading}>
              Exit Game
            </button>
          </div>

          <div className="game-area">
            {renderGame()}
          </div>

          <div className="game-actions">
            {showHintBar && (
              <button
                className="game-action-btn game-action-btn--yellow"
                onClick={handleUseHint}
                disabled={hints === 0 || paused}
              >
                💡 Use Hint ({hints} left)
              </button>
            )}
            <button
              className="game-action-btn game-action-btn--green"
              onClick={handleSaveProgress}
              disabled={saving}
            >
              💾 {saving ? 'Saving...' : 'Save & Go Home'}
            </button>
            <button className="game-action-btn game-action-btn--orange" onClick={handlePause}>
              {paused ? '▶️ Resume' : '⏸ Pause'}
            </button>
          </div>
        </div>
      </div>

      {/* Result Modal */}
      {result && (
        <div className="result-overlay">
          <div className="result-modal">
            <div className="result-modal__icon">{result.isWin ? '🏆' : '😔'}</div>
            {/* ✅ Fixed: shows "You Win!" or "Game Over!" correctly */}
            <h2 className="result-modal__title">{result.isWin ? 'You Win!' : 'Game Over!'}</h2>
            <p className="result-modal__sub">{gameName} · {difficulty}</p>
            <div className="result-stats">
              <div className="result-stat">
                <span className="result-stat__icon">⭐</span>
                <span className="result-stat__value">{result.score.toLocaleString()}</span>
                <span className="result-stat__label">Final Score</span>
              </div>
              <div className="result-stat">
                <span className="result-stat__icon">⏱</span>
                <span className="result-stat__value">{formatTime(result.time)}</span>
                <span className="result-stat__label">Time Used</span>
              </div>
            </div>
            <div className="result-actions">
              <button className="result-btn result-btn--blue" onClick={() => navigate('/')}>
                🏠 Back to Home
              </button>
              <button className="result-btn result-btn--green" onClick={() => navigate('/leaderboard')}>
                🏆 Leaderboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePage;