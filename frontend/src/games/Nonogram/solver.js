// generate patterns for a single line
export function generateLinePatterns(length, clues) {
  const results = [];

  function backtrack(pos, clueIndex, line) {
    if (clueIndex === clues.length) {
      const rest = line.concat(Array(length - line.length).fill(0));
      results.push(rest);
      return;
    }

    const block = clues[clueIndex];

    for (let i = pos; i <= length - block; i++) {
      let newLine = [...line];

      while (newLine.length < i) newLine.push(0);

      for (let j = 0; j < block; j++) {
        newLine.push(1);
      }

      if (clueIndex < clues.length - 1) newLine.push(0);

      backtrack(newLine.length, clueIndex + 1, newLine);
    }
  }

  backtrack(0, 0, []);
  return results;
}

// solver that counts solutions
export function solveNonogram(rowClues, colClues, size, limit = 2) {
  const rowPatterns = rowClues.map(clue =>
    generateLinePatterns(size, clue)
  );

  let solutions = 0;
  const grid = Array.from({ length: size }, () => Array(size).fill(null));

  function isValidCol(c) {
    const col = grid.map(row => row[c]);
    const clues = colClues[c];

    let groups = [];
    let count = 0;

    for (let cell of col) {
      if (cell === 1) count++;
      else {
        if (count > 0) groups.push(count);
        count = 0;
      }
    }
    if (count > 0) groups.push(count);

    for (let i = 0; i < groups.length; i++) {
      if (groups[i] > clues[i]) return false;
    }

    return true;
  }

  function backtrack(r) {
    if (solutions >= limit) return;

    if (r === size) {
      solutions++;
      return;
    }

    for (let pattern of rowPatterns[r]) {
      grid[r] = pattern;

      let ok = true;
      for (let c = 0; c < size; c++) {
        if (!isValidCol(c)) {
          ok = false;
          break;
        }
      }

      if (ok) backtrack(r + 1);
    }
  }

  backtrack(0);
  return solutions;
}