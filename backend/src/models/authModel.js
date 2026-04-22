const db = require('../config/db');

// Find a player by email
const findPlayerByEmail = async (email) => {
  const [rows] = await db.query(
    'SELECT * FROM players WHERE email = ?', 
    [email]
  );
  return rows[0]; // return first result or undefined
};

// Create a new player
const createPlayer = async (playerName, email, passwordHash) => {
  const [result] = await db.query(
    'INSERT INTO players (player_id, player_name, email, password_hash) VALUES (UUID(), ?, ?, ?)',
    [playerName, email, passwordHash]
  );
  return result;
};
module.exports = { findPlayerByEmail, createPlayer };