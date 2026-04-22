const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/playerController');
const { protect } = require('../middleware/authMiddleware');

// All profile routes require login
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.get('/paused', protect, async (req, res) => {
  try {
    const { getPausedSessions } = require('../models/playerModel');
    const sessions = await getPausedSessions(req.player.playerId);
    res.json(sessions);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});
module.exports = router;