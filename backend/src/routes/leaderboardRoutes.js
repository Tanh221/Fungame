const express = require('express');
const router = express.Router();
const { fetchLeaderboard, fetchGlobalLeaderboard } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

// Public routes - no login needed to view leaderboard
router.get('/', fetchLeaderboard);
router.get('/global', fetchGlobalLeaderboard);

module.exports = router;