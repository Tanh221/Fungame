const { getPlayerProfile, updatePlayer } = require('../models/playerModel');

// GET /api/players/profile
const getProfile = async (req, res) => {
  try {
    const playerId = req.player.playerId;

    const profile = await getPlayerProfile(playerId);
    if (!profile) {
      return res.status(404).json({ message: 'Player not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/players/profile
const updateProfile = async (req, res) => {
  try {
    const playerId = req.player.playerId;
    const { playerName, gender } = req.body;

    await updatePlayer(playerId, playerName, gender);
    res.json({ message: 'Profile updated successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getProfile, updateProfile };