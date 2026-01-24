import { useState } from 'react';
import api from '../api/axiosInstance';

const ExpenseList = ({ expenses, onExpenseDeleted }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Currency formatter
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const categoryLabels = {
    food: 'Food & Dining',
    transport: 'Transportation',
    entertainment: 'Entertainment',
    utilities: 'Utilities',
    health: 'Health & Medical',
    education: 'Education',
    family: 'Family',
    other: 'Other',
  };

  const categoryColors = {
    food: 'bg-blue-100 text-blue-800',
    transport: 'bg-green-100 text-green-800',
    entertainment: 'bg-purple-100 text-purple-800',
    utilities: 'bg-yellow-100 text-yellow-800',
    health: 'bg-red-100 text-red-800',
    education: 'bg-indigo-100 text-indigo-800',
    family: 'bg-pink-100 text-pink-800',
    other: 'bg-gray-100 text-gray-800',
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.delete(`/api/expenses/${expenseId}`);

      if (onExpenseDeleted) {
        onExpenseDeleted(expenseId);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStart = (expense) => {
    setEditingId(expense._id);
    setEditData({
      amount: expense.amount,
      category: expense.category,
      description: expense.description,
      date: new Date(expense.date).toISOString().split('T')[0],
    });
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditSubmit = async (expenseId) => {
    setLoading(true);
    setError('');

    try {
      await api.put(`/api/expenses/${expenseId}`, editData);

      setEditingId(null);
      setEditData({});

      // Trigger refresh
      if (onExpenseDeleted) {
        onExpenseDeleted(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md animate-fade-in">
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900 border-b border-red-200 dark:border-red-700 animate-slide-in-down">
          <p className="text-red-800 dark:text-red-200">❌ {error}</p>
        </div>
      )}

      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {expenses.map((expense, index) => (
          <li key={expense._id} className="p-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-gray-700 animate-slide-in-up smooth-transition" style={{animationDelay: `${index * 0.05}s`}}>
            {editingId === expense._id ? (
              // Edit mode
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="number"
                    name="amount"
                    value={editData.amount}
                    onChange={handleEditChange}
                    step="0.01"
                    min="0"
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <select
                    name="category"
                    value={editData.category}
                    onChange={handleEditChange}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="food">Food & Dining</option>
                    <option value="transport">Transportation</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="utilities">Utilities</option>
                    <option value="health">Health & Medical</option>
                    <option value="education">Education</option>
                    <option value="family">Family</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <input
                  type="date"
                  name="date"
                  value={editData.date}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSubmit(expense._id)}
                    disabled={loading}
                    className="flex-1 bg-green-600 dark:bg-green-700 text-white py-2 rounded hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleEditCancel}
                    disabled={loading}
                    className="flex-1 bg-gray-600 dark:bg-gray-700 text-white py-2 rounded hover:bg-gray-700 dark:hover:bg-gray-600 disabled:bg-gray-400 dark:disabled:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode - Mobile responsive layout
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                    <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${categoryColors[expense.category]}`}>
                      {categoryLabels[expense.category]}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium text-sm sm:text-base truncate">{expense.description}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="text-left sm:text-right">
                    <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(expense.amount)}</p>
                  </div>
                  <div className="flex gap-3 sm:gap-2">
                    <button
                      onClick={() => handleEditStart(expense)}
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 text-sm font-medium p-1 sm:p-0 touch-manipulation"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      disabled={loading}
                      className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium disabled:text-gray-400 dark:disabled:text-gray-600 p-1 sm:p-0 touch-manipulation"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList;
