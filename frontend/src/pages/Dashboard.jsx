import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import AIChat from '../components/AIChat';
import FinancialAnalytics from '../components/FinancialAnalytics';
import BudgetList from '../components/BudgetList';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isDarkMode: isDark, toggleTheme } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');
  const [userCurrency, setUserCurrency] = useState('INR');

  // Currency formatter helper
  const formatCurrency = (amount, currency = userCurrency) => {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'JPY': '¥'
    };
    return `${symbols[currency] || '₹'}${parseFloat(amount).toFixed(2)}`;
  };

  useEffect(() => {
    fetchData();
    fetchUserCurrency();
  }, []);

  const fetchUserCurrency = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/auth/profile`, { withCredentials: true });
      if (response.data.currency) {
        setUserCurrency(response.data.currency);
      }
    } catch (err) {
      console.error('Failed to fetch user currency:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, analyticsRes] = await Promise.all([
        axios.get(`${API_URL}/api/expenses`, { withCredentials: true }),
        axios.get(`${API_URL}/api/expenses/analytics/summary`, { withCredentials: true })
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
    family: 'Family',
    other: 'Other',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">FinAdvisor</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-400 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                aria-label="Toggle theme"
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              
              <Link to="/profile" className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="h-8 w-8 rounded-full" />
                ) : (
                  <span>👤</span>
                )}
                <span className="hidden sm:inline ml-2">{user?.name}</span>
              </Link>
              <button
                onClick={logout}
                className="bg-indigo-600 dark:bg-indigo-700 text-white px-3 py-2 sm:px-4 rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Financial Dashboard</h2>
          </div>

          {/* Tab Navigation - Scrollable on mobile */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-4 sm:mb-6 overflow-x-auto">
            <div className="flex space-x-4 sm:space-x-8 min-w-max pb-1">
              <button
                onClick={() => setActiveTab('expenses')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'expenses'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                💰 <span className="hidden xs:inline">Expenses &</span> Analytics
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'ai'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                🤖 AI <span className="hidden xs:inline">Financial</span> Advisor
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'analytics'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                📊 <span className="hidden xs:inline">Advanced</span> Analytics
              </button>
              <button
                onClick={() => setActiveTab('budgets')}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === 'budgets'
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                🎯 Budgets
              </button>
            </div>
          </div>

          {/* Expenses Tab */}
          {activeTab === 'expenses' && (
            <>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg card-hover animate-slide-in-up" style={{animationDelay: '0.1s'}}>
              <div className="p-3 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-md flex items-center justify-center animate-bounce-gentle">
                      <span className="text-white text-sm sm:text-lg">💰</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Total Expenses</dt>
                      <dd className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(analytics?.totalAmount || 0)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg card-hover animate-slide-in-up" style={{animationDelay: '0.2s'}}>
              <div className="p-3 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500 rounded-md flex items-center justify-center animate-bounce-gentle" style={{animationDelay: '0.2s'}}>
                      <span className="text-white text-sm sm:text-lg">📊</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Transactions</dt>
                      <dd className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{analytics?.expenseCount || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg card-hover animate-slide-in-up" style={{animationDelay: '0.3s'}}>
              <div className="p-3 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-md flex items-center justify-center animate-bounce-gentle" style={{animationDelay: '0.4s'}}>
                      <span className="text-white text-sm sm:text-lg">📈</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Last 30 Days</dt>
                      <dd className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(analytics?.last30DaysTotal || 0)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg card-hover animate-slide-in-up" style={{animationDelay: '0.4s'}}>
              <div className="p-3 sm:p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500 rounded-md flex items-center justify-center animate-bounce-gentle" style={{animationDelay: '0.6s'}}>
                      <span className="text-white text-sm sm:text-lg">📋</span>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 truncate">Avg Expense</dt>
                      <dd className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(analytics?.averageExpense || 0)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 animate-slide-in-up smooth-transition" style={{animationDelay: '0.5s'}}>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                  <span className="text-lg sm:text-xl mr-2">📊</span>
                  Spending by Category
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(analytics.byCategory).map(([category, amount], index) => (
                    amount > 0 && (
                      <div key={category} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 animate-slide-in-up" style={{animationDelay: `${0.5 + index * 0.05}s`}}>
                        <span className="text-sm text-gray-700 dark:text-gray-300 capitalize font-medium">{categoryLabels[category]}</span>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 sm:w-24 lg:w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-600 to-indigo-400 dark:from-indigo-500 dark:to-indigo-300 h-2 rounded-full smooth-transition"
                              style={{
                                width: `${(amount / analytics.totalAmount) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white font-bold text-right w-20 sm:w-24">{formatCurrency(amount)}</span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6 animate-slide-in-up smooth-transition" style={{animationDelay: '0.6s'}}>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center">
                  <span className="text-lg sm:text-xl mr-2">📅</span>
                  Monthly Breakdown
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(analytics.byMonth)
                    .sort()
                    .reverse()
                    .slice(0, 6)
                    .map(([month, amount], index) => (
                      <div key={month} className="flex justify-between items-center animate-slide-in-up smooth-transition" style={{animationDelay: `${0.6 + index * 0.05}s`}}>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{new Date(month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
                        <span className="text-gray-900 dark:text-white font-bold">{formatCurrency(amount)}</span>
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
            </>
          )}

          {/* AI Chat Tab */}
          {activeTab === 'ai' && (
            <div className="bg-white shadow rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 280px)', minHeight: '400px', maxHeight: '700px' }}>
              <AIChat />
            </div>
          )}

          {/* Advanced Analytics Tab */}
          {activeTab === 'analytics' && (
            <FinancialAnalytics />
          )}

          {/* Budgets Tab */}
          {activeTab === 'budgets' && (
            <BudgetList />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;