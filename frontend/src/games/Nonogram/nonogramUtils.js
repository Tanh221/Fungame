export function generateSolution(size) {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () =>
      Math.random() < 0.45 ? 1 : 0
    )
  );
}

export function getClues(line) {
  const clues = [];
  let count = 0;

  for (let cell of line) {
    if (cell === 1) count++;
    else {
      if (count > 0) clues.push(count);
      count = 0;
    }
  }

  if (count > 0) clues.push(count);
  return clues.length ? clues : [0];
}

export function generateClues(board) {
  const rowClues = board.map(getClues);

  const colClues = board[0].map((_, i) =>
    getClues(board.map(row => row[i]))
  );

  return { rowClues, colClues };
}