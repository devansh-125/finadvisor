import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleAuthCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      console.error('❌ Auth error:', error);
      navigate('/login?error=' + error);
      return;
    }

    if (token) {
      console.log('✅ Token received, storing...');
      handleAuthCallback(token);
      // Navigate to dashboard after storing token
      navigate('/dashboard');
    } else {
      console.error('❌ No token in callback');
      navigate('/login?error=no_token');
    }
  }, [searchParams, navigate, handleAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
