const db = require('../config/db');

// Start a new game session
const createSession = async (playerId, gameId, difficulty) => {
  const [result] = await db.query(
    `INSERT INTO game_sessions 
      (session_id, player_id, game_id, difficulty, state, score, start_time)
     VALUES (UUID(), ?, ?, ?, 'PLAYING', 0, NOW())`,
    [playerId, gameId, difficulty]
  );
  return result;
};

// Get session by ID
const getSessionById = async (sessionId) => {
  const [rows] = await db.query(
    'SELECT * FROM game_sessions WHERE session_id = ?',
    [sessionId]
  );
  return rows[0];
};

// Update session score and state
const updateSession = async (sessionId, score, state) => {
  const [result] = await db.query(
    `UPDATE game_sessions 
     SET score = ?, state = ?, end_time = CASE WHEN ? = 'FINISHED' THEN NOW() ELSE end_time END
     WHERE session_id = ?`,
    [score, state, state, sessionId]
  );
  return result;
};

// Get all finished sessions for a player
const getPlayerSessions = async (playerId) => {
  const [rows] = await db.query(
    `SELECT 
        gs.session_id,
        gs.state,
        gs.difficulty,
        gs.score,
        gs.start_time,
        gs.end_time,
        TIMESTAMPDIFF(SECOND, gs.start_time, gs.end_time) AS time_seconds,
        g.game_type,
        g.game_id,
        gs.result
     FROM game_sessions gs
     JOIN games g ON gs.game_id = g.game_id
     WHERE gs.player_id = ?
     ORDER BY gs.start_time DESC`,
    [playerId]
  );
  return rows;
};
const saveBoardState = async (sessionId, boardState) => {
  await db.query(
    'UPDATE game_sessions SET board_state = ? WHERE session_id = ?',
    [JSON.stringify(boardState), sessionId]
  );
};


module.exports = { createSession, getSessionById, updateSession, getPlayerSessions, saveBoardState };