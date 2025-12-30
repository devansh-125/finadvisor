import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">FinAdvisor</h1>
          <h2 className="text-xl font-bold text-gray-700">AI-Powered Financial Guidance</h2>
        </div>

        <div className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Sign in to your account</h3>
            <div className="flex justify-center">
              <a
                href="http://localhost:5000/api/auth/google"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C6.438,2,1.514,6.926,1.514,13s4.924,11,11.031,11c5.787,0,10.732-4.105,11.14-9.852h-11.14V10.239z"
                  />
                </svg>
                Sign in with Google
              </a>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mt-4">
              New to FinAdvisor?{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.href = 'http://localhost:5000/api/auth/google';
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Create account
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Secure login powered by Google OAuth
        </p>
      </div>
    </div>
  );
};

export default Login;