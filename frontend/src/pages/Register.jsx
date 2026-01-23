import { API_URL } from '../config';

const Register = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 px-4 py-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">FinAdvisor</h1>
          <h2 className="text-lg sm:text-xl font-bold text-gray-700">Create Your Account</h2>
        </div>

        <div className="mt-6 sm:mt-8 space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-6">Get started with Google</h3>
            <div className="flex justify-center">
              <a
                href={`${API_URL}/api/auth/google`}
                className="inline-flex items-center justify-center px-5 sm:px-6 py-3 border border-transparent text-sm sm:text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition touch-manipulation active:scale-95"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 c0-3.331,2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C6.438,2,1.514,6.926,1.514,13s4.924,11,11.031,11c5.787,0,10.732-4.105,11.14-9.852h-11.14V10.239z"
                  />
                </svg>
                Sign up with Google
              </a>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600 mt-4">
              Already have an account?{' '}
              <a
                href="/login"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-gray-500">
          Quick signup with Google OAuth
        </p>
      </div>
    </div>
  );
};

export default Register;