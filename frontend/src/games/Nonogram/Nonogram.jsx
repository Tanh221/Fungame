import { useState, useEffect } from 'react';
import useNonogram from './useNonogram';
import './Nonogram.css';

const DIFFICULTY_INFO = {
  easy:   { color: '#57A773', size: '5×5',   desc: 'Small grid — great for beginners!' },
  medium: { color: '#3185FC', size: '7×7',   desc: 'Medium challenge, needs logic.' },
  hard:   { color: '#D16014', size: '10×10', desc: 'Large grid — only for experts!' },
};

const Nonogram = ({
  difficulty = 'medium',
  onScoreChange,
  onGameOver,
  onHintUsed,
  paused = false,
}) => {
  const {
    board, rowClues, colClues,
    toggleCell, applyHint, hintsLeft,
    loading, score, won, size, resetBoard,
  } = useNonogram(difficulty);

  // fill | cross
  const [drawMode, setDrawMode] = useState('fill');

  const info = DIFFICULTY_INFO[difficulty] || DIFFICULTY_INFO.medium;

  // ✅ Use useEffect to notify parent — avoids infinite render loop
  useEffect(() => {
    if (onScoreChange) onScoreChange(score);
  }, [score]); // eslint-disable-line

  useEffect(() => {
    if (won && onGameOver) onGameOver(score, true);
  }, [won]); // eslint-disable-line

  const handleHint = () => {
    applyHint();
    if (onHintUsed) onHintUsed();
  };

  const handleCellClick = (r, c) => {
    if (!paused) toggleCell(r, c, drawMode);
  };

  if (loading) {
    return (
      <div className="nono-loading">
        <div className="nono-spinner" />
        <p>Generating puzzle...</p>
      </div>
    );
  }

  return (
    <div className="nono-container">
      <div className="nono-game">

        {/* Top bar */}
        <div className="nono-topbar">
          <div className="nono-stat">
            <span className="nono-stat__label">Score</span>
            <span className="nono-stat__value" style={{ color: info.color }}>{score}</span>
          </div>
          <div className="nono-stat">
            <span className="nono-stat__label">Hints</span>
            <span className="nono-stat__value">{'💡'.repeat(hintsLeft) || '—'}</span>
          </div>

          {/* Fill / Cross switch */}
          <div className="nono-mode-switch">
            <button
              className={`nono-mode-btn ${drawMode === 'fill' ? 'nono-mode-btn--active' : ''}`}
              onClick={() => setDrawMode('fill')}
              style={{ '--mode-color': info.color }}
            >
              ■ Fill
            </button>
            <button
              className={`nono-mode-btn ${drawMode === 'cross' ? 'nono-mode-btn--active' : ''}`}
              onClick={() => setDrawMode('cross')}
              style={{ '--mode-color': '#aaa' }}
            >
              ✕ Cross
            </button>
          </div>

          <button className="nono-reset-btn" onClick={resetBoard}>↺ Reset</button>
        </div>

        {/* Board */}
        <div className="nono-board-wrapper" style={{ '--size': size }}>
          <div className="nono-corner" />

          {/* Column clues */}
          <div className="nono-col-clues">
            {colClues.map((clue, c) => (
              <div key={c} className="nono-clue nono-clue--col">
                {clue.map((n, i) => (
                  <span key={i} className="nono-clue__num">{n}</span>
                ))}
              </div>
            ))}
          </div>

          {/* Rows */}
          {board.map((row, r) => (
            <div key={r} className="nono-row">
              <div className="nono-clue nono-clue--row">
                {rowClues[r]?.map((n, i) => (
                  <span key={i} className="nono-clue__num">{n}</span>
                ))}
              </div>
              {row.map((cell, c) => (
                <button
                  key={c}
                  className={[
                    'nono-cell',
                    cell === 1 ? 'nono-cell--filled'  : '',
                    cell === 0 ? 'nono-cell--crossed' : '',
                    (c + 1) % 5 === 0 && c !== size - 1 ? 'nono-cell--section-right'  : '',
                    (r + 1) % 5 === 0 && r !== size - 1 ? 'nono-cell--section-bottom' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => handleCellClick(r, c)}
                  disabled={paused || won}
                  style={{ '--accent': info.color }}
                />
              ))}
            </div>
          ))}
        </div>

        <p className="nono-mode-hint">
          Current mode: <strong>{drawMode === 'fill' ? '■ Fill' : '✕ Cross'}</strong>
          {' '}— use the switch above to change
        </p>
      </div>

      {/* Info Panel */}
      <div className="nono-info-panel">
        <div className="nono-info-card" style={{ borderColor: info.color }}>
          <div className="nono-info-header" style={{ background: info.color }}>
            <span className="nono-info-badge">
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} — {info.size}
            </span>
          </div>
          <div className="nono-info-body">
            <p className="nono-info-desc">{info.desc}</p>
            <div className="nono-info-divider" />
            <p className="nono-info-label">How to play</p>
            <p className="nono-info-desc">
              Fill cells to match the clue numbers.<br />
              Numbers show consecutive filled groups.<br />
              e.g. <strong>2 1</strong> = two filled, gap, one filled.
            </p>
            <div className="nono-info-divider" />
            <p className="nono-info-label">Scoring</p>
            <p className="nono-info-desc">
              +10 per filled cell<br />
              +50 per unused hint<br />
              -50 per hint used
            </p>
            <div className="nono-info-divider" />
            <p className="nono-info-label">Grid sizes</p>
            {Object.entries(DIFFICULTY_INFO).map(([key, val]) => (
              <div key={key} className={`nono-diff-row ${key === difficulty ? 'nono-diff-row--active' : ''}`}>
                <span className="nono-diff-dot" style={{ background: val.color }} />
                <span className="nono-diff-name" style={{ color: key === difficulty ? val.color : '#888' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <span className="nono-diff-size">{val.size}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          className="nono-hint-btn"
          onClick={handleHint}
          disabled={hintsLeft === 0 || won || paused}
          style={{ borderColor: info.color, color: info.color }}
        >
          💡 Use Hint ({hintsLeft} left)
        </button>
      </div>
    </div>
  );
};

export default Nonogram;