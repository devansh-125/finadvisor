import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    income: '',
    savings: '',
    goals: [],
    currency: 'INR'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [goalError, setGoalError] = useState('');
  const [newGoal, setNewGoal] = useState('');

  // Currency symbols mapping
  const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹',
    JPY: '¥'
  };

  const getCurrencySymbol = () => currencySymbols[formData.currency] || formData.currency;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        withCredentials: true
      });
      setProfile(res.data);
      setFormData({
        age: res.data.profile?.age || '',
        income: res.data.profile?.income || '',
        savings: res.data.profile?.savings || '',
        goals: res.data.profile?.goals || [],
        currency: res.data.profile?.currency || 'INR'
      });
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'income' || name === 'savings' ? parseFloat(value) || '' : value
    }));
    setError('');
  };

  const handleAddGoal = () => {
    setGoalError('');
    if (!newGoal.trim()) {
      setGoalError('Please enter a financial goal');
      return;
    }
    if (newGoal.trim().length < 3) {
      setGoalError('Goal must be at least 3 characters long');
      return;
    }
    if (formData.goals.includes(newGoal.trim())) {
      setGoalError('This goal already exists');
      return;
    }
    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal.trim()]
    }));
    setNewGoal('');
  };

  const handleRemoveGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await axios.put('http://localhost:5000/api/auth/profile', formData, {
        withCredentials: true
      });
      setSuccess('Profile updated successfully!');
      fetchProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 to-slate-800' 
          : 'bg-gradient-to-br from-slate-50 to-blue-50'
      }`}>
        <div className="text-center">
          <div className={`w-12 h-12 rounded-full border-4 border-t-blue-500 animate-spin mx-auto mb-4 ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          }`}></div>
          <p className={`${isDark ? 'text-slate-300' : 'text-gray-600'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'
    }`}>
      {/* Header/Navbar */}
      <nav className={`backdrop-blur-md border-b transition-all ${
        isDark
          ? 'bg-slate-900/50 border-slate-700/30'
          : 'bg-white/50 border-slate-200/30'
      } sticky top-0 z-40 shadow-lg`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Links */}
            <div className="flex items-center gap-8">
              <Link 
                to="/dashboard" 
                className={`text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent hover:opacity-80 transition`}
              >
                FinAdvisor
              </Link>
              <Link 
                to="/dashboard" 
                className={`font-medium transition hover:scale-105 ${
                  isDark 
                    ? 'text-slate-300 hover:text-cyan-400' 
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                Dashboard
              </Link>
            </div>

            {/* User Info & Controls */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${
                  isDark
                    ? 'bg-blue-900/50 hover:bg-blue-800/70 text-yellow-300'
                    : 'bg-white/30 hover:bg-white/50 text-gray-700'
                }`}
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>

              {/* User Profile */}
              <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${
                isDark 
                  ? 'bg-slate-800/50 border border-slate-700/30' 
                  : 'bg-white/50 border border-slate-200'
              }`}>
                {user?.profilePicture && (
                  <img 
                    src={user.profilePicture} 
                    alt={user?.name} 
                    className="h-8 w-8 rounded-full border-2 border-blue-500" 
                  />
                )}
                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                  {user?.name}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all hover:shadow-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header Card */}
        <div className={`rounded-2xl backdrop-blur-sm transition-all mb-8 ${
          isDark
            ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 shadow-2xl'
            : 'bg-white/70 border border-slate-200 shadow-lg'
        }`}>
          <div className="px-8 py-8">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full blur opacity-75 animate-pulse"></div>
                {user?.profilePicture ? (
                  <img 
                    src={user.profilePicture} 
                    alt={user?.name} 
                    className="relative h-24 w-24 rounded-full border-4 border-white shadow-lg"
                  />
                ) : (
                  <div className="relative h-24 w-24 rounded-full border-4 border-white bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user?.name?.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h1 className={`text-3xl font-bold mb-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.name}
                </h1>
                <p className={`text-lg ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  {user?.email}
                </p>
                <div className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  ✓ Account verified
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className={`rounded-2xl backdrop-blur-sm transition-all overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-600/30 shadow-2xl'
            : 'bg-white/70 border border-slate-200 shadow-lg'
        }`}>
          <div className="px-8 py-8 space-y-8">
            {/* Alert Messages */}
            {error && (
              <div className={`p-4 rounded-xl border-l-4 backdrop-blur-sm transition-all ${
                isDark
                  ? 'bg-red-900/30 border-red-700/50 text-red-300'
                  : 'bg-red-50 border-red-500 text-red-700'
              }`}>
                <p className="font-medium">❌ {error}</p>
              </div>
            )}

            {success && (
              <div className={`p-4 rounded-xl border-l-4 backdrop-blur-sm transition-all ${
                isDark
                  ? 'bg-green-900/30 border-green-700/50 text-green-300'
                  : 'bg-green-50 border-green-500 text-green-700'
              }`}>
                <p className="font-medium">✓ {success}</p>
              </div>
            )}

            {/* Personal Information Section */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                👤 Personal Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Enter your age"
                    min="0"
                    max="150"
                    className={`w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:ring-cyan-500'
                        : 'bg-white/50 border border-slate-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                    }`}
                  />
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Optional
                  </p>
                </div>

                {/* Currency */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    Preferred Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                      isDark
                        ? 'bg-slate-700/50 border border-slate-600/50 text-white focus:ring-cyan-500'
                        : 'bg-white/50 border border-slate-300 text-gray-900 focus:ring-blue-500'
                    }`}
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="JPY">Japanese Yen (¥)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className={`border-t ${isDark ? 'border-slate-600/30' : 'border-slate-200'}`}></div>

            {/* Financial Information Section */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                💰 Financial Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Annual Income */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    Annual Income
                  </label>
                  <div className="relative">
                    <span className={`absolute left-4 top-3 text-lg font-bold ${
                      isDark ? 'text-cyan-400' : 'text-blue-600'
                    }`}>
                      {getCurrencySymbol()}
                    </span>
                    <input
                      type="number"
                      name="income"
                      value={formData.income}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="1000"
                      min="0"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:ring-cyan-500'
                          : 'bg-white/50 border border-slate-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Your yearly income
                  </p>
                </div>

                {/* Current Savings */}
                <div>
                  <label className={`block text-sm font-semibold mb-2 ${
                    isDark ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    Current Savings
                  </label>
                  <div className="relative">
                    <span className={`absolute left-4 top-3 text-lg font-bold ${
                      isDark ? 'text-cyan-400' : 'text-blue-600'
                    }`}>
                      {getCurrencySymbol()}
                    </span>
                    <input
                      type="number"
                      name="savings"
                      value={formData.savings}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="1000"
                      min="0"
                      className={`w-full pl-10 pr-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:ring-cyan-500'
                          : 'bg-white/50 border border-slate-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                    Amount saved
                  </p>
                </div>
              </div>
            </section>

            {/* Divider */}
            <div className={`border-t ${isDark ? 'border-slate-600/30' : 'border-slate-200'}`}></div>

            {/* Financial Goals Section */}
            <section>
              <h2 className={`text-2xl font-bold mb-6 flex items-center gap-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                🎯 Financial Goals
              </h2>
              
              <div className="space-y-4">
                {/* Add Goal */}
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                      placeholder="e.g., Buy a house, Save for retirement, Build emergency fund"
                      className={`flex-1 px-4 py-3 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                        isDark
                          ? 'bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:ring-cyan-500'
                          : 'bg-white/50 border border-slate-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={handleAddGoal}
                      className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-medium transition-all hover:shadow-lg"
                    >
                      ➕ Add
                    </button>
                  </div>
                  {goalError && (
                    <p className="text-sm text-red-500 font-medium">{goalError}</p>
                  )}
                </div>

                {/* Goals List */}
                {formData.goals.length > 0 ? (
                  <div className="space-y-3 mt-6">
                    <p className={`text-sm font-semibold ${
                      isDark ? 'text-slate-300' : 'text-gray-600'
                    }`}>
                      Your Goals ({formData.goals.length})
                    </p>
                    {formData.goals.map((goal, index) => (
                      <div 
                        key={index} 
                        className={`flex items-center justify-between p-4 rounded-xl transition-all hover:shadow-lg ${
                          isDark
                            ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-700/30 hover:border-blue-600/50'
                            : 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🎯</span>
                          <span className={`font-medium ${
                            isDark ? 'text-slate-100' : 'text-gray-800'
                          }`}>
                            {goal}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(index)}
                          className={`px-4 py-2 rounded-lg transition-all font-medium ${
                            isDark
                              ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                              : 'text-red-600 hover:bg-red-100 hover:text-red-700'
                          }`}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 rounded-xl ${
                    isDark 
                      ? 'bg-slate-700/30 border border-slate-600/30' 
                      : 'bg-slate-100/50 border border-slate-200'
                  }`}>
                    <p className={`text-lg ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      No goals added yet. Add one to get started! 🚀
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Divider */}
            <div className={`border-t ${isDark ? 'border-slate-600/30' : 'border-slate-200'}`}></div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-500 disabled:to-slate-600 text-white py-3 rounded-lg font-semibold transition-all hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="inline-block animate-spin">⏳</span>
                    Saving...
                  </>
                ) : (
                  <>
                    💾 Save Profile
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                  isDark
                    ? 'bg-slate-700/50 hover:bg-slate-600 text-slate-100 border border-slate-600/50'
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Profile;