import { useState } from 'react';
import axios from 'axios';

const ExpenseList = ({ expenses, onExpenseDeleted }) => {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categoryLabels = {
    food: 'Food & Dining',
    transport: 'Transportation',
    entertainment: 'Entertainment',
    utilities: 'Utilities',
    health: 'Health & Medical',
    education: 'Education',
    other: 'Other',
  };

  const categoryColors = {
    food: 'bg-blue-100 text-blue-800',
    transport: 'bg-green-100 text-green-800',
    entertainment: 'bg-purple-100 text-purple-800',
    utilities: 'bg-yellow-100 text-yellow-800',
    health: 'bg-red-100 text-red-800',
    education: 'bg-indigo-100 text-indigo-800',
    other: 'bg-gray-100 text-gray-800',
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axios.delete(`http://localhost:5000/api/expenses/${expenseId}`, {
        withCredentials: true
      });

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
      await axios.put(`http://localhost:5000/api/expenses/${expenseId}`, editData, {
        withCredentials: true
      });

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
      <div className="bg-white shadow rounded-lg p-8 text-center">
        <p className="text-gray-500 text-lg">No expenses yet. Add one to get started!</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <ul className="divide-y divide-gray-200">
        {expenses.map(expense => (
          <li key={expense._id} className="p-4 sm:px-6">
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
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <select
                    name="category"
                    value={editData.category}
                    onChange={handleEditChange}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="food">Food & Dining</option>
                    <option value="transport">Transportation</option>
                    <option value="entertainment">Entertainment</option>
                    <option value="utilities">Utilities</option>
                    <option value="health">Health & Medical</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <input
                  type="date"
                  name="date"
                  value={editData.date}
                  onChange={handleEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditSubmit(expense._id)}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleEditCancel}
                    disabled={loading}
                    className="flex-1 bg-gray-600 text-white py-2 rounded hover:bg-gray-700 disabled:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${categoryColors[expense.category]}`}>
                      {categoryLabels[expense.category]}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{expense.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900">${parseFloat(expense.amount).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditStart(expense)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(expense._id)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-900 text-sm font-medium disabled:text-gray-400"
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
