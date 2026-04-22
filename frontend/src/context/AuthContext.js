import { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [player, setPlayer] = useState(
    JSON.parse(localStorage.getItem('player')) || null
  );
  // Load player from localStorage so they stay logged in after refresh

  const loginPlayer = (playerData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('player', JSON.stringify(playerData));
    setPlayer(playerData);
  };

  const logoutPlayer = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('player');
    setPlayer(null);
  };

  return (
    <AuthContext.Provider value={{ player, loginPlayer, logoutPlayer }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth anywhere
export const useAuth = () => useContext(AuthContext);