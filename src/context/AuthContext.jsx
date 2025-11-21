import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if login has expired (1 week)
  const checkLoginExpiration = () => {
    const expiresAt = localStorage.getItem('login_expires_at');
    if (expiresAt) {
      const expirationTime = parseInt(expiresAt, 10);
      const currentTime = Date.now();
      
      if (currentTime > expirationTime) {
        // Login has expired, logout user
        logout();
        return false;
      }
      return true;
    }
    return false;
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      // Check if login is still valid (not expired)
      if (checkLoginExpiration()) {
        setUser(JSON.parse(storedUser));
      } else {
        // Expired, clear everything
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('login_expires_at');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    // Store login timestamp (1 week from now) if not already set
    if (!localStorage.getItem('login_expires_at')) {
      const loginTimestamp = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
      localStorage.setItem('login_expires_at', loginTimestamp.toString());
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('login_expires_at');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

