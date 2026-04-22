const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findPlayerByEmail, createPlayer } = require('../models/authModel');

// REGISTER
const register = async (req, res) => {
  try {
    const { playerName, email, password } = req.body;
    // 👆 Get data sent from frontend

    // Check if email already exists
    const existing = await findPlayerByEmail(email);
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password before saving
    // (never store plain text passwords!)
    const passwordHash = await bcrypt.hash(password, 10);

    // Save to database
    await createPlayer(playerName, email, passwordHash);

    res.status(201).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find player in database
    const player = await findPlayerByEmail(email);
    if (!player) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare password with hashed version
    const isMatch = await bcrypt.compare(password, player.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Create a JWT token (like a login ticket)
    const token = jwt.sign(
      { playerId: player.player_id, playerName: player.player_name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // token expires in 7 days
    );

    res.json({
      message: 'Login successful!',
      token,
      player: {
        playerId: player.player_id,
        playerName: player.player_name,
        email: player.email,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login };