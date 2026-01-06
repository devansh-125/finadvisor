import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';

const BudgetForm = ({ budget, onSave, onCancel }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    category: budget?.category || '',
    amount: budget?.amount || '',
    period: budget?.period || 'monthly',
    alerts: budget?.alerts || { enabled: true, thresholds: [80, 100] }
  });
  const [loading, setLoading] = useState(false);

  const categories = ['food', 'transport', 'entertainment', 'utilities', 'health', 'education', 'family', 'other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baseURL = 'http://localhost:5000';
      const url = budget ? `${baseURL}/api/budgets/${budget._id}` : `${baseURL}/api/budgets`;
      const method = budget ? 'put' : 'post';

      const response = await axios({
        method,
        url,
        data: formData,
        withCredentials: true
      });

      onSave(response.data);
    } catch (error) {
      console.error('Error saving budget:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save budget';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAlertChange = (index, value) => {
    const newThresholds = [...formData.alerts.thresholds];
    newThresholds[index] = parseInt(value);
    setFormData(prev => ({
      ...prev,
      alerts: {
        ...prev.alerts,
        thresholds: newThresholds
      }
    }));
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
      <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {budget ? 'Edit Budget' : 'Create New Budget'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="">Select a category</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Budget Amount ({user?.profile?.currency || 'USD'})
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            placeholder="Enter budget amount"
            className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'}`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Period
          </label>
          <select
            name="period"
            value={formData.period}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <input
              type="checkbox"
              checked={formData.alerts.enabled}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                alerts: { ...prev.alerts, enabled: e.target.checked }
              }))}
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm font-medium">Enable Alerts</span>
          </label>
        </div>

        {formData.alerts.enabled && (
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Alert Thresholds (%)
            </label>
            <div className="flex space-x-2">
              {formData.alerts.thresholds.map((threshold, index) => (
                <input
                  key={index}
                  type="number"
                  value={threshold}
                  onChange={(e) => handleAlertChange(index, e.target.value)}
                  min="1"
                  max="100"
                  className={`w-20 px-2 py-1 rounded text-center border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              ))}
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Get alerts when you reach these percentages of your budget
            </p>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
          >
            {loading ? 'Saving...' : (budget ? 'Update Budget' : 'Create Budget')}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={`flex-1 py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 focus:ring-gray-600' : 'bg-gray-300 text-gray-700 hover:bg-gray-400 focus:ring-gray-500'}`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;