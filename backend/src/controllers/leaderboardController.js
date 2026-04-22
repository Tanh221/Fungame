const { getLeaderboard, getGlobalLeaderboard } = require('../models/leaderboardModel');

// GET /api/leaderboard?gameType=2048&difficulty=medium
const fetchLeaderboard = async (req, res) => {
  try {
    const { gameType, difficulty = 'medium', limit = 10 } = req.query;
    
    if (!gameType) {
      return res.status(400).json({ message: 'gameType is required' });
    }

    const data = await getLeaderboard(gameType, difficulty, Number(limit));
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/leaderboard/global
const fetchGlobalLeaderboard = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const data = await getGlobalLeaderboard(Number(limit));
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { fetchLeaderboard, fetchGlobalLeaderboard };