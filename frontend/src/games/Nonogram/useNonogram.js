import { useState, useEffect, useCallback } from "react";
import { generateSolution, generateClues } from "./nonogramUtils";
import { solveNonogram } from "./solver";

const DIFFICULTY_SIZE = {
  easy:   5,
  medium: 7,
  hard:   10,
};

function createEmptyBoard(size) {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

export default function useNonogram(difficulty = 'medium') {
  const size = DIFFICULTY_SIZE[difficulty] || 7;

  const [solution,  setSolution]  = useState(null);
  const [rowClues,  setRowClues]  = useState([]);
  const [colClues,  setColClues]  = useState([]);
  const [board,     setBoard]     = useState(() => createEmptyBoard(size));
  const [hintsLeft, setHintsLeft] = useState(3);
  const [loading,   setLoading]   = useState(true);
  const [score,     setScore]     = useState(0);
  const [won,       setWon]       = useState(false);

  useEffect(() => {
    setLoading(true);
    setWon(false);
    setScore(0);
    setBoard(createEmptyBoard(size));
    setHintsLeft(3);

    const timeout = setTimeout(() => {
      let found = false;
      let attempts = 0;
      while (!found && attempts < 200) {
        attempts++;
        const sol = generateSolution(size);
        const { rowClues: rc, colClues: cc } = generateClues(sol);
        const count = solveNonogram(rc, cc, size);
        if (count === 1) {
          setSolution(sol);
          setRowClues(rc);
          setColClues(cc);
          found = true;
        }
      }
      setLoading(false);
    }, 50);

    return () => clearTimeout(timeout);
  }, [size]);

  // Toggle cell based on current draw mode
  // mode: 'fill' → null→1→null, 'cross' → null→0→null
  const toggleCell = useCallback((r, c, mode = 'fill') => {
    if (won) return;
    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      const current = newBoard[r][c];
      if (mode === 'fill') {
        newBoard[r][c] = current === 1 ? null : 1;
      } else {
        // cross mode
        newBoard[r][c] = current === 0 ? null : 0;
      }
      return newBoard;
    });
  }, [won]);

  const applyHint = useCallback(() => {
    if (!solution || hintsLeft <= 0 || won) return;
    const wrong = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        // only reveal unfilled cells that should be filled
        if (solution[r][c] === 1 && board[r][c] !== 1) wrong.push([r, c]);
      }
    }
    if (wrong.length === 0) return;
    const [r, c] = wrong[Math.floor(Math.random() * wrong.length)];
    setBoard(prev => {
      const newBoard = prev.map(row => [...row]);
      newBoard[r][c] = 1;
      return newBoard;
    });
    setHintsLeft(h => h - 1);
    setScore(s => Math.max(0, s - 50));
  }, [solution, hintsLeft, board, size, won]);

  // Check win: only filled cells need to match solution
  // (crosses are optional/ignored for win condition)
  useEffect(() => {
    if (!solution || loading || won) return;

    let correct = true;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (solution[r][c] === 1 && board[r][c] !== 1) {
          correct = false;
          break;
        }
        if (solution[r][c] === 0 && board[r][c] === 1) {
          correct = false;
          break;
        }
      }
      if (!correct) break;
    }

    if (correct) {
      const filledCells = solution.flat().filter(v => v === 1).length;
      const baseScore   = filledCells * 10;
      const hintBonus   = hintsLeft * 50;
      setScore(baseScore + hintBonus);
      setWon(true);
    }
  }, [board, solution, loading, size, hintsLeft, won]);

  const resetBoard = useCallback(() => {
    setBoard(createEmptyBoard(size));
    setScore(0);
    setWon(false);
    setHintsLeft(3);
  }, [size]);

  return {
    board, solution, rowClues, colClues,
    toggleCell, applyHint, hintsLeft,
    loading, score, won, size, resetBoard,
  };
}