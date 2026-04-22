import { useState, useEffect, useCallback } from 'react';

const SIZE = 4;

// Tile spawn probability per difficulty
const getRandomTile = (difficulty) => {
  const rand = Math.random();
  switch (difficulty) {
    case 'easy':
      return rand < 0.85 ? 2 : 4;           // 85% 2, 15% 4
    case 'medium':
      return rand < 0.65 ? 2 : 4;           // 65% 2, 35% 4
    case 'hard':
      if (rand < 0.6) return 2;             // 60% 2
      if (rand < 0.9) return 4;             // 30% 4
      return 8;                             // 10% 8
    default:
      return 2;
  }
};

const emptyBoard = () => Array(SIZE).fill(null).map(() => Array(SIZE).fill(0));

const addRandomTile = (board, difficulty = 'medium') => {
  const empty = [];
  board.forEach((row, r) => row.forEach((val, c) => { if (!val) empty.push([r, c]); }));
  if (!empty.length) return board;
  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const next = board.map((row) => [...row]);
  next[r][c] = getRandomTile(difficulty);
  return next;
};

const slideRow = (row) => {
  const filtered = row.filter((v) => v !== 0);
  let score = 0;
  for (let i = 0; i < filtered.length - 1; i++) {
    if (filtered[i] === filtered[i + 1]) {
      filtered[i] *= 2;
      score += filtered[i];
      filtered.splice(i + 1, 1);
    }
  }
  while (filtered.length < SIZE) filtered.push(0);
  return { row: filtered, score };
};

const transpose   = (board) => board[0].map((_, c) => board.map((row) => row[c]));
const reverseRows = (board) => board.map((row) => [...row].reverse());

const move = (board, direction) => {
  let b = board.map((row) => [...row]);
  let totalScore = 0;
  let moved = false;

  if (direction === 'right') b = reverseRows(b);
  if (direction === 'up')    b = transpose(b);
  if (direction === 'down')  b = reverseRows(transpose(b));

  const next = b.map((row) => {
    const { row: slid, score } = slideRow(row);
    if (slid.join(',') !== row.join(',')) moved = true;
    totalScore += score;
    return slid;
  });

  let result = next;
  if (direction === 'right') result = reverseRows(next);
  if (direction === 'up')    result = transpose(next);
  if (direction === 'down')  result = transpose(reverseRows(next));

  return { board: result, score: totalScore, moved };
};

const hasMovesLeft = (board) => {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!board[r][c]) return true;
      if (c < SIZE - 1 && board[r][c] === board[r][c + 1]) return true;
      if (r < SIZE - 1 && board[r][c] === board[r + 1][c]) return true;
    }
  }
  return false;
};

const hasWon = (board) => board.some((row) => row.some((v) => v >= 2048));

const useGame2048 = (difficulty = 'medium', initialBoard = null, initialScore = 0) => {
  const freshBoard = () => addRandomTile(addRandomTile(emptyBoard(), difficulty), difficulty);

  const [board,     setBoard]     = useState(() => initialBoard || freshBoard());
  const [score,     setScore]     = useState(initialScore);
  const [best,      setBest]      = useState(initialScore);
  const [gameOver,  setGameOver]  = useState(false);
  const [won,       setWon]       = useState(false);
  const [continued, setContinued] = useState(false);

  const handleMove = useCallback((direction) => {
    if (gameOver) return;

    setBoard((prev) => {
      const { board: next, score: gained, moved } = move(prev, direction);
      if (!moved) return prev;
      const withTile = addRandomTile(next, difficulty);
      setScore((s) => {
        const newScore = s + gained;
        setBest((b) => Math.max(b, newScore));
        return newScore;
      });
      if (!won && hasWon(withTile)) setWon(true);
      if (!hasMovesLeft(withTile) && !hasWon(withTile)) setGameOver(true);
      return withTile;
    });
  }, [gameOver, won, difficulty]);

  useEffect(() => {
    const MAP = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
    const onKey = (e) => { if (MAP[e.key]) { e.preventDefault(); handleMove(MAP[e.key]); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleMove]);

  const restart = () => {
    setBoard(freshBoard());
    setScore(0);
    setBest(0);
    setGameOver(false);
    setWon(false);
    setContinued(false);
  };

  const keepPlaying = () => setContinued(true);

  return { board, score, best, gameOver, won, continued, restart, keepPlaying, handleMove };
};

export default useGame2048;