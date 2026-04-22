const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes'); 
const gameSessionRoutes = require('./routes/gameSessionRoutes');
const leaderboardRoutes  = require('./routes/leaderboardRoutes');
const playerRoutes       = require('./routes/playerRoutes'); 
const app = express();

app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ message: 'FunGame API is running!' });
});

app.use('/api/auth', authRoutes); 
app.use('/api/sessions', gameSessionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/players',     playerRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});