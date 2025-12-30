import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/auth/user', {
        withCredentials: true
      });
      setUser(res.data);
    } catch (err) {
      console.log('Not authenticated');
    }
    setLoading(false);
  };

  const logout = () => {
    window.location.href = 'http://localhost:5000/api/auth/logout';
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};