import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

// Configure axios to always send credentials
axios.defaults.withCredentials = true;

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if this is an OAuth redirect
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('user');
    
    if (userId) {
      // OAuth redirect - wait for session cookie to be set
      console.log('🔵 OAuth redirect detected, userId:', userId);
      console.log('🔵 Cookies:', document.cookie);
      
      // Try multiple times to fetch user (cookie might take a moment)
      let attempts = 0;
      const maxAttempts = 5;
      const tryFetchUser = async () => {
        attempts++;
        console.log(`🔄 Fetching user attempt ${attempts}/${maxAttempts}...`);
        const success = await fetchUser();
        // Clean up URL after successful fetch or max attempts
        if (success || attempts >= maxAttempts) {
          window.history.replaceState({}, document.title, window.location.pathname);
        } else if (attempts < maxAttempts) {
          // Retry after a delay
          setTimeout(tryFetchUser, 300);
        }
      };
      
      // Start fetching after a short delay
      setTimeout(tryFetchUser, 200);
    } else {
      // Normal page load
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      console.log('🔍 Fetching user from /api/auth/user...');
      console.log('🔍 Cookies being sent:', document.cookie);
      
      const res = await axios.get(`${API_URL}/api/auth/user`, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ User fetched successfully:', res.data);
      console.log('✅ Response headers:', res.headers);
      
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
      console.error('❌ Error details:', err.response?.data || err.message);
      setUser(null);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    window.location.href = `${API_URL}/api/auth/logout`;
  };

  return (
    <AuthContext.Provider value={{ user, logout, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};