import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, analyticsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/expenses', { withCredentials: true }),
        axios.get('http://localhost:5000/api/expenses/analytics/summary', { withCredentials: true })
      ]);
      setExpenses(expensesRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseAdded = () => {
    fetchData();
  };

  const handleExpenseDeleted = () => {
    fetchData();
  };

  const categoryLabels = {
    food: 'Food & Dining',
    transport: 'Transportation',
    entertainment: 'Entertainment',
    utilities: 'Utilities',
    health: 'Health & Medical',
    education: 'Education',
    other: 'Other',
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
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FinAdvisor</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="text-gray-700 hover:text-indigo-600 flex items-center">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="h-8 w-8 rounded-full inline mr-2" />
                ) : (
                  <span className="mr-2">👤</span>
                )}
                {user?.name}
              </Link>
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Dashboard</h2>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">💰</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                      <dd className="text-lg font-bold text-gray-900">${analytics?.totalAmount?.toFixed(2) || '0.00'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">📊</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Transaction Count</dt>
                      <dd className="text-lg font-bold text-gray-900">{analytics?.expenseCount || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">📈</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Last 30 Days</dt>
                      <dd className="text-lg font-bold text-gray-900">${analytics?.last30DaysTotal?.toFixed(2) || '0.00'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-lg">📋</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Expense</dt>
                      <dd className="text-lg font-bold text-gray-900">${analytics?.averageExpense?.toFixed(2) || '0.00'}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Category</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.byCategory).map(([category, amount]) => (
                    amount > 0 && (
                      <div key={category} className="flex justify-between items-center">
                        <span className="text-gray-700 capitalize">{categoryLabels[category]}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full"
                              style={{
                                width: `${(amount / analytics.totalAmount) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-gray-900 font-medium text-right w-20">${amount.toFixed(2)}</span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(analytics.byMonth)
                    .sort()
                    .reverse()
                    .slice(0, 6)
                    .map(([month, amount]) => (
                      <div key={month} className="flex justify-between items-center">
                        <span className="text-gray-700">{new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                        <span className="text-gray-900 font-medium">${amount.toFixed(2)}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Expense Form */}
          <ExpenseForm onExpenseAdded={handleExpenseAdded} />

          {/* Expense List */}
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All Expenses</h3>
          <ExpenseList expenses={expenses} onExpenseDeleted={handleExpenseDeleted} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;