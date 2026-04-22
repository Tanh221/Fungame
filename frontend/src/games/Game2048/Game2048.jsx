import { useEffect, useRef } from 'react';
import useGame2048 from './useGame2048';
import './Game2048.css';

const TILE_STYLES = {
  0:    { bg: '#cdc1b4', color: 'transparent' },
  2:    { bg: '#eee4da', color: '#776e65' },
  4:    { bg: '#ede0c8', color: '#776e65' },
  8:    { bg: '#f2b179', color: '#f9f6f2' },
  16:   { bg: '#f59563', color: '#f9f6f2' },
  32:   { bg: '#f67c5f', color: '#f9f6f2' },
  64:   { bg: '#f65e3b', color: '#f9f6f2' },
  128:  { bg: '#edcf72', color: '#f9f6f2' },
  256:  { bg: '#edcc61', color: '#f9f6f2' },
  512:  { bg: '#edc850', color: '#f9f6f2' },
  1024: { bg: '#edc53f', color: '#f9f6f2' },
  2048: { bg: '#edc22e', color: '#f9f6f2' },
};

const DIFFICULTY_INFO = {
  easy:   { color: '#57A773', spawn: '85% 2, 15% 4',          desc: 'Mostly 2s — easier to plan merges!' },
  medium: { color: '#3185FC', spawn: '65% 2, 35% 4',          desc: 'Balanced mix of 2s and 4s.' },
  hard:   { color: '#D16014', spawn: '60% 2, 30% 4, 10% 8',   desc: 'Occasional 8s make it unpredictable!' },
};

const getTileStyle = (val) => TILE_STYLES[val] || { bg: '#3c3a32', color: '#f9f6f2' };
const getFontSize  = (val) => val >= 1024 ? '1.1rem' : val >= 128 ? '1.4rem' : '1.7rem';

const useSwipe = (onMove) => {
  const startRef = useRef(null);
  const onTouchStart = (e) => { startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd   = (e) => {
    if (!startRef.current) return;
    const dx = e.changedTouches[0].clientX - startRef.current.x;
    const dy = e.changedTouches[0].clientY - startRef.current.y;
    if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;
    onMove(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    startRef.current = null;
  };
  return { onTouchStart, onTouchEnd };
};

const Game2048 = ({ difficulty='medium', initialBoard=null, initialScore=0, onScoreChange, onBoardChange, onGameOver, paused=false }) => {
  const { board, score, best, gameOver, won, continued, restart, keepPlaying, handleMove } =
    useGame2048(difficulty, initialBoard, initialScore);
  const swipe = useSwipe((dir) => { if (!paused) handleMove(dir); });
  const info  = DIFFICULTY_INFO[difficulty] || DIFFICULTY_INFO.medium;

  useEffect(() => { if (onScoreChange) onScoreChange(score); }, [score]);
  useEffect(() => { if (onBoardChange) onBoardChange(board); }, [board]);
  useEffect(() => { if (won      && onGameOver) onGameOver(score, true);  }, [won]);      // eslint-disable-line
  useEffect(() => { if (gameOver && onGameOver) onGameOver(score, false); }, [gameOver]); // eslint-disable-line

  return (
    <div className="g2048-container">
      <div className="g2048-left">
        <div className="g2048-wrapper" {...swipe}>
          <div className="g2048-scorebar">
            <div className="g2048-score-box"><span className="g2048-score-label">SCORE</span><span className="g2048-score-val">{score.toLocaleString()}</span></div>
            <div className="g2048-score-box g2048-score-box--best"><span className="g2048-score-label">BEST</span><span className="g2048-score-val">{best.toLocaleString()}</span></div>
            <button className="g2048-restart-btn" onClick={restart}>New Game</button>
          </div>
          <p className="g2048-hint">{paused ? '⏸ Game Paused' : 'Use arrow keys ← → ↑ ↓ to move tiles'}</p>
          <div className="g2048-board">
            {Array(16).fill(null).map((_, i) => <div key={i} className="g2048-cell-bg" />)}
            {board.map((row, r) => row.map((val, c) => {
              const style = getTileStyle(val);
              return (
                <div key={`${r}-${c}`}
                  className={`g2048-tile ${val ? 'g2048-tile--filled' : ''} ${val === 2048 ? 'g2048-tile--win' : ''}`}
                  style={{ '--r': r, '--c': c, background: style.bg, color: style.color, fontSize: getFontSize(val) }}>
                  {val || ''}
                </div>
              );
            }))}
            {paused && <div className="g2048-overlay g2048-overlay--paused"><h2>⏸ Paused</h2><p>Press Resume to continue</p></div>}
            {won && !paused && (
              <div className="g2048-overlay g2048-overlay--win">
                <h2>You reached 2048! 🎉</h2><p>Score: {score.toLocaleString()}</p>
                <div className="g2048-overlay-btns">
                  <button onClick={keepPlaying}>Keep Playing</button>
                  <button onClick={restart}>New Game</button>
                </div>
              </div>
            )}
            {gameOver && !paused && (
              <div className="g2048-overlay">
                <h2>Game Over! 😔</h2><p>Score: {score.toLocaleString()}</p>
                <button onClick={restart}>Try Again</button>
              </div>
            )}
          </div>
          <div className="g2048-mobile-btns">
            <div className="g2048-mobile-row"><button onClick={() => handleMove('up')}>↑</button></div>
            <div className="g2048-mobile-row">
              <button onClick={() => handleMove('left')}>←</button>
              <button onClick={() => handleMove('down')}>↓</button>
              <button onClick={() => handleMove('right')}>→</button>
            </div>
          </div>
        </div>
      </div>
      <div className="g2048-info-panel">
        <div className="g2048-info-card" style={{ borderColor: info.color }}>
          <div className="g2048-info-header" style={{ background: info.color }}>
            <span className="g2048-info-badge">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Mode</span>
          </div>
          <div className="g2048-info-body">
            <p className="g2048-info-label">Tile spawn chances</p>
            <p className="g2048-info-desc">{info.spawn}</p>
            <p className="g2048-info-desc" style={{ marginTop: 4 }}>{info.desc}</p>
            <div className="g2048-info-divider" />
            <p className="g2048-info-label">All difficulties</p>
            {Object.entries(DIFFICULTY_INFO).map(([key, val]) => (
              <div key={key} className={`g2048-diff-row ${key === difficulty ? 'g2048-diff-row--active' : ''}`}>
                <span className="g2048-diff-dot" style={{ background: val.color }} />
                <span className="g2048-diff-name" style={{ color: key === difficulty ? val.color : '#888' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                <span className="g2048-diff-tiles">{val.spawn}</span>
              </div>
            ))}
            <div className="g2048-info-divider" />
            <p className="g2048-info-label">How to Win</p>
            <p className="g2048-info-desc">Merge tiles to reach <strong>2048</strong>!<br />Score = sum of all merged values.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game2048;