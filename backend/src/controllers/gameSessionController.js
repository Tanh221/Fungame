const { createSession, getSessionById, updateSession, getPlayerSessions, saveBoardState } = require('../models/gameSessionModel');

// Start a new game
const startGame = async (req, res) => {
  try {
    const { gameId, difficulty } = req.body;
    const playerId = req.player.playerId;
    // comes from the JWT token via middleware

    await createSession(playerId, gameId, difficulty);
    
    // Get the session we just created
    const [rows] = await require('../config/db').query(
      'SELECT * FROM game_sessions WHERE player_id = ? ORDER BY start_time DESC LIMIT 1',
      [playerId]
    );

    res.status(201).json({
      message: 'Game started!',
      session: rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Finish a game and save result
const finishGame = async (req, res) => {
  try {
    const { sessionId, score, state: reqState, result } = req.body; // 👈 result here
    const playerId = req.player.playerId;
    const session  = await getSessionById(sessionId);

    if (!session || session.player_id !== playerId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const finalState  = reqState  || 'FINISHED';
    const finalResult = result    || null;

    // 👇 Must include result in the UPDATE
    await require('../config/db').query(
      `UPDATE game_sessions 
       SET score = ?, state = ?, result = ?,
           end_time = CASE WHEN ? = 'FINISHED' THEN NOW() ELSE end_time END
       WHERE session_id = ?`,
      [score, finalState, finalResult, finalState, sessionId]
    );

    if (finalState === 'FINISHED') {
      await require('../config/db').query(
        `INSERT INTO game_results (result_id, session_id, player_id, score, time_seconds, difficulty)
         VALUES (UUID(), ?, ?, ?, TIMESTAMPDIFF(SECOND, ?, NOW()), ?)`,
        [sessionId, playerId, score, session.start_time, session.difficulty]
      );
    }

    res.json({ message: finalState === 'PAUSED' ? 'Progress saved!' : 'Game finished!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Get player's game history
const getHistory = async (req, res) => {
  try {
    console.log('getHistory called, playerId:', req.player.playerId);
    const playerId = req.player.playerId;
    const sessions = await getPlayerSessions(playerId);
    console.log('sessions result:', sessions);
    res.json(sessions);
  } catch (error) {
    console.error('getHistory ERROR:', error); // log full error object
    res.status(500).json({ message: 'Server error', detail: error.message });
  }
};

module.exports = { startGame, finishGame, getHistory };