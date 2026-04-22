const express = require('express');
const router = express.Router();
const { startGame, finishGame, getHistory } = require('../controllers/gameSessionController');
const { protect } = require('../middleware/authMiddleware');
const { saveBoardState, getSessionById } = require('../models/gameSessionModel'); 

// ── Specific routes FIRST ──
router.post('/start',      protect, startGame);
router.post('/finish',     protect, finishGame);
router.get('/history',     protect, getHistory); 

router.post('/save-board', protect, async (req, res) => {
  try {
    const { sessionId, boardState } = req.body;
    await saveBoardState(sessionId, boardState);
    res.json({ message: 'Board saved!' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ── Dynamic route LAST ── (otherwise it catches /history, /save-board etc.)
router.get('/:sessionId', protect, async (req, res) => {
  try {
    const session = await getSessionById(req.params.sessionId);
    res.json(session);
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;