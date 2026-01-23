import { API_URL } from '../config';

const Login = () => {

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden px-4 sm:px-6">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10">
        <div className="text-center">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 mb-2 animate-pulse">
              FinAdvisor
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
              <h2 className="text-base sm:text-xl font-semibold text-slate-300">AI-Powered Financial Guidance</h2>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping animation-delay-1000"></div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 sm:mb-8">Access Your Financial Future</h3>
            <div className="flex justify-center">
              <button
                onClick={() => window.location.href = `${API_URL}/api/auth/google`}
                className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 hover:from-cyan-400 hover:to-purple-500 w-full sm:w-auto"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C6.438,2,1.514,6.926,1.514,13s4.924,11,11.031,11c5.787,0,10.732-4.105,11.14-9.852h-11.14V10.239z"
                    />
                  </svg>
                  <span className="text-base sm:text-lg">Continue with Google</span>
                </div>
              </button>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-sm text-slate-400">
              New to FinAdvisor?{' '}
              <button
                onClick={() => window.location.href = `${API_URL}/api/auth/google`}
                className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              >
                Create your account
              </button>
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500 flex items-center justify-center space-x-2">
            <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span>
            <span>Quantum-secure authentication</span>
            <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse animation-delay-500"></span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;