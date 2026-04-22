const db = require('../config/db');

const getPlayerProfile = async (playerId) => {
  const [rows] = await db.query(
    `SELECT
      p.player_id,
      p.player_name,
      p.email,
      p.gender,
      p.created_at,
      COUNT(DISTINCT gs.session_id) AS total_games_played,
      COUNT(DISTINCT CASE WHEN gs.state = 'FINISHED' THEN gs.session_id END) AS games_finished,
      MAX(gr.score) AS highest_score_ever
     FROM players p
     LEFT JOIN game_sessions gs ON p.player_id = gs.player_id
     LEFT JOIN game_results  gr ON p.player_id = gr.player_id
     WHERE p.player_id = ?
     GROUP BY p.player_id`,
    [playerId]
  );
  return rows[0];
};

// Update player profile
const updatePlayer = async (playerId, playerName, gender) => {
  const [result] = await db.query(
    'UPDATE players SET player_name = ?, gender = ? WHERE player_id = ?',
    [playerName, gender, playerId]
  );
  return result;
};

const getPausedSessions = async (playerId) => {
  const [rows] = await db.query(
    `SELECT gs.session_id, gs.score, gs.difficulty, gs.start_time, g.game_type, g.game_id
     FROM game_sessions gs
     JOIN games g ON gs.game_id = g.game_id
     WHERE gs.player_id = ? AND gs.state = 'PAUSED'
     ORDER BY gs.start_time DESC`,
    [playerId]
  );
  return rows;
};

module.exports = { getPlayerProfile, updatePlayer, getPausedSessions };