import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axiosInstance';
import BudgetForm from './BudgetForm';

const BudgetList = () => {
  const { user } = useAuth();
  const { isDarkMode: isDark } = useTheme();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const response = await api.get('/api/budgets/status/all');
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setShowForm(false);
    setEditingBudget(null);
    fetchBudgets(); // Refresh the list
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowForm(true);
  };

  const handleDelete = async (budgetId) => {
    if (!confirm('Are you sure you want to delete this budget?')) return;

    try {
      await api.delete(`/api/budgets/${budgetId}`);
      fetchBudgets(); // Refresh the list
    } catch (error) {
      console.error('Error deleting budget:', error);
      alert('Failed to delete budget: ' + (error.response?.data?.message || error.message));
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'exceeded': return 'Over Budget';
      case 'warning': return 'Near Limit';
      default: return 'On Track';
    }
  };

  // eslint-disable-next-line no-unused-vars
  const getStatusColor = (status) => {
    switch (status) {
      case 'exceeded': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-green-600';
    }
  };

  if (loading) {
    return <div className={`text-center py-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading budgets...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
        <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Budget Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 dark:bg-indigo-700 text-white px-4 py-2.5 sm:py-2 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium transition touch-manipulation text-sm sm:text-base"
        >
          + Create Budget
        </button>
      </div>

      {showForm && (
        <BudgetForm
          budget={editingBudget}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingBudget(null);
          }}
        />
      )}

      {budgets.length === 0 ? (
        <div className={`text-center py-12 rounded-lg border-2 border-dashed ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-300'}`}>
          <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} mb-4`}>
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No budgets yet</h3>
          <p className={`mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Create your first budget to start tracking your spending.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {budgets.map(({ budget, status }) => (
            <div key={budget._id} className={`rounded-lg shadow-lg p-4 sm:p-6 transition hover:shadow-xl ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
              <div className="flex justify-between items-start mb-4 sm:mb-5">
                <div className="min-w-0 flex-1">
                  <h3 className={`text-lg sm:text-xl font-bold capitalize mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {budget.category}
                  </h3>
                  <p className={`text-xs sm:text-sm capitalize font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{budget.period} budget</p>
                </div>
                <div className="flex space-x-1 ml-2 flex-shrink-0">
                  <button
                    onClick={() => handleEdit(budget)}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition touch-manipulation ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                    title="Edit budget"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(budget._id)}
                    className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition touch-manipulation ${isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}`}
                    title="Delete budget"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Spent</span>
                  <span className={`font-bold text-base ${isDark ? 'text-yellow-300' : 'text-orange-600'}`}>
                    {user?.profile?.currency || '₹'}{status.spent}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Budget Limit</span>
                  <span className={`font-bold text-base ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                    {user?.profile?.currency || '₹'}{budget.amount}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Remaining</span>
                  <span className={`font-bold text-base ${status.remaining < 0 ? (isDark ? 'text-red-300' : 'text-red-600') : (isDark ? 'text-emerald-300' : 'text-emerald-600')}`}>
                    {user?.profile?.currency || '₹'}{status.remaining}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className={`w-full rounded-full h-3 overflow-hidden border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300'}`}>
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(status.percentage)}`}
                    style={{ width: `${Math.min(status.percentage, 100)}%` }}
                  ></div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className={`text-sm font-bold ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    {status.percentage.toFixed(1)}% used
                  </span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    status.status === 'exceeded' 
                      ? isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
                      : status.status === 'warning'
                      ? isDark ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-700'
                      : isDark ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-700'
                  }`}>
                    {getStatusText(status.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BudgetList;