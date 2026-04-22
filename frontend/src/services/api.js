import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically attach token to every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// AUTH
export const register = (data) => API.post('/auth/register', data);
export const login    = (data) => API.post('/auth/login', data);

// PLAYER
export const getProfile    = ()     => API.get('/players/profile');
export const updateProfile = (data) => API.put('/players/profile', data);

// SESSIONS
export const startGame  = (data) => API.post('/sessions/start', data);
export const finishGame = (data) => API.post('/sessions/finish', data);
export const getHistory = ()     => API.get('/sessions/history');
export const getPausedSessions = () => API.get('/players/paused');
export const saveBoardState  = (data) => API.post('/sessions/save-board', data);
export const getSessionById  = (sessionId) => API.get(`/sessions/${sessionId}`);
// LEADERBOARD
export const getLeaderboard       = (gameType, difficulty) => 
  API.get(`/leaderboard?gameType=${gameType}&difficulty=${difficulty}`);
export const getGlobalLeaderboard = () => API.get('/leaderboard/global');