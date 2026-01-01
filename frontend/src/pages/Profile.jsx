import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { user, logout } = useAuth();
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="text-xl font-bold text-gray-900 hover:text-indigo-600">
                FinAdvisor
              </Link>
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
                Dashboard
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                {user?.profilePicture && (
                  <img src={user.profilePicture} alt={user?.name} className="h-8 w-8 rounded-full" />
                )}
                <span className="text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {/* Profile Header */}
          <div className="px-6 py-8 border-b border-gray-200">
            <div className="flex items-center gap-6">
              {user?.profilePicture && (
                <img src={user.profilePicture} alt={user?.name} className="h-16 w-16 rounded-full" />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-800">{success}</p>
              </div>
            )}

            {/* Personal Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Currency
                  </label>
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">British Pound (£)</option>
                    <option value="JPY">Japanese Yen (¥)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Income */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Annual Income
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-600 font-semibold text-lg">
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
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Your yearly income</p>
                </div>

                {/* Savings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Savings
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-600 font-semibold text-lg">
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
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Amount saved</p>
                </div>
              </div>
            </div>

            {/* Financial Goals Section */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">💡 Financial Goals</h2>
              
              <div className="space-y-4">
                {/* Add Goal */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                      placeholder="e.g., Buy a house, Save for retirement, Build emergency fund"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={handleAddGoal}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium"
                    >
                      Add
                    </button>
                  </div>
                  {goalError && (
                    <p className="text-sm text-red-600">{goalError}</p>
                  )}
                </div>

                {/* Goals List */}
                {formData.goals.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 font-medium">Your Goals ({formData.goals.length})</p>
                    {formData.goals.map((goal, index) => (
                      <div key={index} className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100 hover:shadow-md transition">
                        <div className="flex items-center gap-3">
                          <span className="text-indigo-600 text-lg">🎯</span>
                          <span className="text-gray-800 font-medium">{goal}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(index)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded transition"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm py-4 text-center">No goals added yet. Add one to get started! 🚀</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t pt-6 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed font-medium transition flex items-center justify-center gap-2"
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
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;