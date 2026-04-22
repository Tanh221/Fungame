import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';


import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage     from './pages/HomePage';
import ProfilePage  from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import GamePage from './pages/GamePage';
// Protected route - redirects to login if not logged in
const ProtectedRoute = ({ children }) => {
  const { player } = useAuth();
  return player ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute><HomePage /></ProtectedRoute>
          }/>
          <Route path="/profile" element={
            <ProtectedRoute><ProfilePage /></ProtectedRoute>
          }/>
          <Route path="/leaderboard" element={
            <ProtectedRoute><LeaderboardPage /></ProtectedRoute>
          }/>
          <Route path="/game/:gameName" element={
            <ProtectedRoute><GamePage /></ProtectedRoute>
          }/>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;