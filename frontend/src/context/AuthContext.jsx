import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Helper to get stored token
const getStoredToken = () => localStorage.getItem('authToken');

// Helper to set auth header
const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(getStoredToken());

  useEffect(() => {
    // Set auth header if token exists
    if (token) {
      setAuthHeader(token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return false;
    }

    try {
      console.log('🔍 Fetching user with token...');
      setAuthHeader(storedToken);
      
      const res = await axios.get(`${API_URL}/api/auth/user`);
      
      console.log('✅ User fetched successfully:', res.data);
      
      if (res.data && res.data._id) {
        setUser(res.data);
        setLoading(false);
        return true;
      } else {
        console.warn('⚠️ No user ID in response');
        setUser(null);
        setLoading(false);
        return false;
      }
    } catch (err) {
      console.error('❌ Failed to fetch user:', err.message);
      // Token might be invalid, clear it
      localStorage.removeItem('authToken');
      setAuthHeader(null);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const handleAuthCallback = (newToken) => {
    console.log('🔑 Storing auth token');
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setAuthHeader(newToken);
  };

  const logout = () => {
    console.log('🚪 Logging out...');
    localStorage.removeItem('authToken');
    setAuthHeader(null);
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading, fetchUser, handleAuthCallback, token }}>
      {children}
    </AuthContext.Provider>
  );
};