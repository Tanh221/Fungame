const db = require('../config/db');

// Get top players for a specific game
const getLeaderboard = async (gameType, difficulty, limit = 10) => {
  const [rows] = await db.query(
    `SELECT
      p.player_name,
      g.game_type,
      MAX(gs.score)                                             AS best_score,
      MIN(TIMESTAMPDIFF(SECOND, gs.start_time, gs.end_time))   AS best_time_seconds
     FROM game_sessions gs
     JOIN players p ON gs.player_id = p.player_id
     JOIN games   g ON gs.game_id   = g.game_id
     WHERE gs.state      = 'FINISHED'
       AND g.game_type   = ?
       AND gs.difficulty = ?
     GROUP BY p.player_id, p.player_name, g.game_type
     ORDER BY best_score DESC, best_time_seconds ASC
     LIMIT ?`,
    [gameType, difficulty, limit]
  );
  return rows;
};

// Get top players across ALL games
const getGlobalLeaderboard = async (limit = 10) => {
  const [rows] = await db.query(
    `SELECT
      p.player_name,
      g.game_type,
      gs.difficulty,
      MAX(gs.score) AS best_score
     FROM game_sessions gs
     JOIN players p ON gs.player_id = p.player_id
     JOIN games   g ON gs.game_id   = g.game_id
     WHERE gs.state = 'FINISHED'
     GROUP BY p.player_id, p.player_name, g.game_type, gs.difficulty
     ORDER BY best_score DESC
     LIMIT ?`,
    [limit]
  );
  return rows;
};

module.exports = { getLeaderboard, getGlobalLeaderboard };