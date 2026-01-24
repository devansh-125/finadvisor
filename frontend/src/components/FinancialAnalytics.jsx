import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const FinancialAnalytics = () => {
  const { user, loading: authLoading } = useAuth();
  const { isDarkMode: isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [, setError] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [newsPage, setNewsPage] = useState(0);
  const [newsFilter, setNewsFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Simple API call for now - will expand later
      const response = await api.get('/api/ai/health-analysis');
      console.log('📊 [FRONTEND] Full response data:', JSON.stringify(response.data, null, 2));
      console.log('📊 [FRONTEND] Categories array:', response.data.analysis?.categories);
      console.log('📊 [FRONTEND] CategoryBreakdown object:', response.data.analysis?.categoryBreakdown);
      console.log('📊 [FRONTEND] Total spent:', response.data.analysis?.totalSpent);
      
      // Verify sorting
      if (response.data.analysis?.categories) {
        const cats = response.data.analysis.categories;
        const breakdown = response.data.analysis.categoryBreakdown;
        console.log('📊 [FRONTEND] Categories with amounts:');
        cats.forEach(cat => {
          const amount = breakdown[cat];
          const percentage = (response.data.analysis.totalSpent > 0) ? ((amount / response.data.analysis.totalSpent) * 100).toFixed(1) : 0;
          console.log(`  ${cat}: ₹${amount} (${percentage}%)`);
        });
      }
      
      setData(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load financial health analysis. Please try again later.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketData = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/api/ai/market-data');
      setMarketData(response.data);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to load market data. Please try again later.');
      setMarketData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'market' && !marketData) {
      fetchMarketData();
    }
  };

  // Helper to safely render numeric values that might be objects
  const renderSafeValue = (val, fallback = 0) => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') {
      return val.rate !== undefined ? val.rate : (val.ratio !== undefined ? val.ratio : (val.value !== undefined ? val.value : fallback));
    }
    return val;
  };

  if (authLoading) {
    return (
      <div className={`rounded-lg shadow-lg p-6 transition-colors ${
        isDark 
          ? 'bg-slate-800 border border-slate-700' 
          : 'bg-white'
      }`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 mx-auto ${
          isDark ? 'border-slate-600' : 'border-slate-200'
        }`}></div>
        <p className={`text-center mt-4 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`rounded-lg shadow-lg p-6 transition-colors ${
        isDark 
          ? 'bg-slate-800 border border-slate-700' 
          : 'bg-white'
      }`}>
        <div className="text-center">
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Please Log In
          </h2>
          <p className={isDark ? 'text-slate-300' : 'text-gray-600'}>
            You need to be logged in to view financial analytics.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all hover:shadow-lg"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg shadow-xl overflow-hidden transition-colors ${
      isDark 
        ? 'bg-slate-800 border border-slate-700' 
        : 'bg-white'
    }`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 transition-all relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div>
            <h2 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Financial Analytics Dashboard</h2>
            <p className="text-blue-100 text-sm sm:text-base">Advanced insights into your financial health</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all hover:scale-110 touch-manipulation self-end sm:self-auto ${
              isDark
                ? 'bg-blue-800/50 hover:bg-blue-700/70 text-yellow-300'
                : 'bg-white/30 hover:bg-white/50 text-white'
            }`}
            title={isDark ? 'Light Mode' : 'Dark Mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b transition-colors overflow-x-auto scrollbar-hide ${
        isDark 
          ? 'border-slate-700 bg-slate-700/50' 
          : 'border-slate-200 bg-slate-50'
      }`}>
        <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6 min-w-max">
          {['overview', 'kpis', 'recommendations', 'market'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm capitalize transition-all whitespace-nowrap touch-manipulation ${
                activeTab === tab
                  ? `border-blue-500 ${isDark ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'}`
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className={`p-4 sm:p-6 transition-colors ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            <h3 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Financial Health Overview
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 mx-auto ${
                  isDark ? 'border-slate-600' : 'border-slate-200'
                }`}></div>
                <p className={`mt-4 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  Loading your financial overview...
                </p>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Overall Health Score Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white lg:col-span-1 lg:row-span-2 shadow-lg hover:shadow-xl transition">
                  <h4 className="text-sm font-semibold opacity-90 mb-4">Overall Health Score</h4>
                  <div className="text-6xl font-bold mb-4">{data.overallScore ?? 0}</div>
                  <div className={`w-full rounded-full h-3 mb-4 ${isDark ? 'bg-blue-300/30' : 'bg-blue-300'}`}>
                    <div
                      className="bg-white rounded-full h-3 transition-all"
                      style={{ width: `${data.overallScore ?? 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm opacity-90 mb-6">out of 100</p>
                  <div className="pt-6 border-t border-blue-400">
                    <p className="text-sm font-semibold flex items-center gap-2">
                      {data.overallScore >= 80 ? '✓ Excellent' : data.overallScore >= 60 ? '⚠ Good' : '✗ Needs Improvement'}
                    </p>
                  </div>
                </div>

                {/* Summary Card */}
                <div className={`p-6 rounded-2xl lg:col-span-2 shadow-md hover:shadow-lg transition ${
                  isDark
                    ? 'bg-slate-700/50 border border-slate-600/30'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Your Summary
                  </h4>
                  <p className={`leading-relaxed ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                    {data.summary || 'Your financial health overview'}
                  </p>
                </div>

                {/* Monthly Spending */}
                <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition ${
                  isDark
                    ? 'bg-slate-700/50 border border-slate-600/30'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Monthly Spending
                  </h4>
                  <div className={`text-3xl font-bold mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    ₹{(data.analysis?.totalSpent || 0).toLocaleString('en-IN')}
                  </div>
                  <p className={`text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                    Total expenses this month
                  </p>
                  <div className={`pt-4 border-t ${isDark ? 'border-slate-600/30' : 'border-slate-200'}`}>
                    <h5 className={`text-sm font-bold mb-3 ${isDark ? 'text-slate-200' : 'text-gray-900'}`}>
                      Top Categories
                    </h5>
                    {data.analysis?.categories && data.analysis.categories.length > 0 ? (
                      <div className="space-y-2">
                        {data.analysis.categories.slice(0, 3).map((cat, idx) => {
                          const amount = data.analysis.categoryBreakdown?.[cat] || 0;
                          const percentage = data.analysis.totalSpent > 0 
                            ? ((amount / data.analysis.totalSpent) * 100).toFixed(0)
                            : 0;
                          return (
                            <div key={idx} className="flex items-center justify-between">
                              <span className={`text-sm font-medium capitalize ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                                {cat}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                                  isDark
                                    ? 'bg-blue-900/50 text-blue-300'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {percentage}%
                                </span>
                                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                                  ₹{amount}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        No spending data available
                      </p>
                    )}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition ${
                  isDark
                    ? 'bg-slate-700/50 border border-slate-600/30'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Score Breakdown
                  </h4>
                  <div className="space-y-4">
                    {/* Savings Rate */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                          Savings Rate
                        </span>
                        <span className={`text-sm font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                          {renderSafeValue(data.kpis?.savingsRate?.rate, 0)}%
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${isDark ? 'bg-slate-600/50' : 'bg-slate-200'}`}>
                        <div
                          className="bg-green-500 rounded-full h-2 transition-all"
                          style={{ width: `${Math.min(renderSafeValue(data.kpis?.savingsRate?.rate, 0), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    {/* Expense Ratio */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                          Expense Ratio
                        </span>
                        <span className={`text-sm font-bold ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                          {renderSafeValue(data.kpis?.expenseRatio?.ratio, 0)}%
                        </span>
                      </div>
                      <div className={`w-full rounded-full h-2 ${isDark ? 'bg-slate-600/50' : 'bg-slate-200'}`}>
                        <div
                          className={`rounded-full h-2 transition-all ${
                            renderSafeValue(data.kpis?.expenseRatio?.ratio, 0) <= 70 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(renderSafeValue(data.kpis?.expenseRatio?.ratio, 0), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className={`p-6 rounded-2xl lg:col-span-2 shadow-md hover:shadow-lg transition ${
                  isDark
                    ? 'bg-slate-700/50 border border-slate-600/30'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    💡 Quick Recommendations
                  </h4>
                  <ul className="space-y-3">
                    {data.recommendations?.slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className={`inline-flex items-center justify-center h-6 w-6 rounded-full font-bold text-sm flex-shrink-0 ${
                          isDark
                            ? 'bg-blue-900/50 text-blue-300'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {idx + 1}
                        </span>
                        <span className={isDark ? 'text-slate-200' : 'text-gray-700'}>
                          {rec.recommendation || rec.description || `Recommendation ${idx + 1}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className={`text-center py-12 rounded-2xl ${
                isDark
                  ? 'bg-slate-700/50 border border-slate-600/30'
                  : 'bg-slate-50 border border-slate-200'
              }`}>
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  No financial data available
                </p>
                <button 
                  onClick={fetchData}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all hover:shadow-lg"
                >
                  Load Financial Data
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'kpis' && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Key Performance Indicators
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 mx-auto ${
                  isDark ? 'border-slate-600' : 'border-slate-200'
                }`}></div>
                <p className={`mt-4 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  Loading your KPIs...
                </p>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Savings Rate */}
                <div className={`p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 ${
                  isDark
                    ? 'bg-gradient-to-br from-emerald-900 to-emerald-800 border-emerald-700 hover:border-emerald-600'
                    : 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-bold ${isDark ? 'text-emerald-200' : 'text-emerald-900'}`}>
                      Savings Rate
                    </h4>
                    <span className="text-3xl">💰</span>
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                    {renderSafeValue(data.kpis?.savingsRate?.rate, 0)}%
                  </div>
                  <p className={`text-sm mb-4 font-medium ${isDark ? 'text-emerald-200' : 'text-emerald-700'}`}>
                    {(() => {
                      const status = data.kpis?.savingsRate?.status;
                      if (status === 'excellent') return '✓ Excellent';
                      if (status === 'good') return '• Good';
                      if (status === 'fair') return '• Fair';
                      return '✗ Low';
                    })()}
                  </p>
                  <div className={`w-full rounded-full h-2.5 ${isDark ? 'bg-emerald-900' : 'bg-emerald-200'} border border-emerald-400/50`}>
                    <div 
                      className="bg-emerald-500 rounded-full h-2.5 transition-all shadow-lg" 
                      style={{ width: `${Math.min(renderSafeValue(data.kpis?.savingsRate?.rate, 0), 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Expense Ratio */}
                <div className={`p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 ${
                  isDark
                    ? 'bg-gradient-to-br from-amber-900 to-orange-800 border-amber-700 hover:border-amber-600'
                    : 'bg-gradient-to-br from-amber-50 to-orange-100 border-amber-300'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-bold ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                      Expense Ratio
                    </h4>
                    <span className="text-3xl">📊</span>
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
                    {renderSafeValue(data.kpis?.expenseRatio?.ratio, 0)}%
                  </div>
                  <p className={`text-sm mb-4 font-medium ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
                    {(() => {
                      const status = data.kpis?.expenseRatio?.status;
                      if (status === 'excellent' || status === 'healthy') return '✓ Healthy';
                      if (status === 'good') return '✓ Good';
                      if (status === 'fair' || status === 'moderate') return '• Moderate';
                      return '✗ High';
                    })()}
                  </p>
                  <div className={`w-full rounded-full h-2.5 ${isDark ? 'bg-amber-900' : 'bg-amber-200'} border border-amber-400/50`}>
                    <div 
                      className="bg-amber-500 rounded-full h-2.5 transition-all shadow-lg" 
                      style={{ width: `${Math.min(renderSafeValue(data.kpis?.expenseRatio?.ratio, 0), 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Monthly Spending */}
                <div className={`p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 ${
                  isDark
                    ? 'bg-gradient-to-br from-sky-900 to-blue-800 border-sky-700 hover:border-sky-600'
                    : 'bg-gradient-to-br from-sky-50 to-blue-100 border-sky-300'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-bold ${isDark ? 'text-sky-200' : 'text-sky-900'}`}>
                      Monthly Avg
                    </h4>
                    <span className="text-3xl">📝</span>
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-sky-300' : 'text-sky-700'}`}>
                    ₹{(data.analysis?.totalSpent || 0).toLocaleString('en-IN')}
                  </div>
                  <p className={`text-sm mb-4 font-medium ${isDark ? 'text-sky-200' : 'text-sky-700'}`}>
                    Total spending
                  </p>
                  <div className={`w-full rounded-full h-2.5 ${isDark ? 'bg-sky-900' : 'bg-sky-200'} border border-sky-400/50`}>
                    <div 
                      className="bg-sky-500 rounded-full h-2.5 shadow-lg" 
                      style={{ width: `${Math.min((renderSafeValue(data.kpis?.expenseRatio?.ratio, 0)), 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Health Score */}
                <div className={`p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all border-2 ${
                  isDark
                    ? 'bg-gradient-to-br from-fuchsia-900 to-purple-800 border-fuchsia-700 hover:border-fuchsia-600'
                    : 'bg-gradient-to-br from-fuchsia-50 to-purple-100 border-fuchsia-300'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-bold ${isDark ? 'text-fuchsia-200' : 'text-fuchsia-900'}`}>
                      Financial Health
                    </h4>
                    <span className="text-3xl">🏥</span>
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-fuchsia-300' : 'text-fuchsia-700'}`}>
                    {data.overallScore ?? 0}/100
                  </div>
                  <p className={`text-sm mb-4 font-medium ${isDark ? 'text-fuchsia-200' : 'text-fuchsia-700'}`}>
                    {(() => {
                      const score = data.overallScore ?? 0;
                      if (score >= 80) return '✓ Excellent';
                      if (score >= 60) return '✓ Good';
                      if (score >= 40) return '• Fair';
                      return '⚠ Need Help';
                    })()}
                  </p>
                  <div className={`w-full rounded-full h-2.5 ${isDark ? 'bg-fuchsia-900' : 'bg-fuchsia-200'} border border-fuchsia-400/50`}>
                    <div 
                      className="bg-fuchsia-500 rounded-full h-2.5 transition-all shadow-lg" 
                      style={{ width: `${Math.min(data.overallScore ?? 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Top Spending Category */}
                {data.analysis?.categories?.length > 0 && (
                  <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition border ${
                    isDark
                      ? 'bg-gradient-to-br from-red-900/30 to-red-800/30 border-red-700/30 hover:border-red-600/50'
                      : 'bg-gradient-to-br from-red-50 to-red-100 border-red-200'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className={`text-lg font-bold ${isDark ? 'text-red-300' : 'text-gray-900'}`}>
                        Top Category
                      </h4>
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className={`text-3xl font-bold mb-2 capitalize ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                      {data.analysis.categories[0]}
                    </div>
                    <div className={`text-2xl font-bold mb-2 ${isDark ? 'text-red-300' : 'text-gray-800'}`}>
                      ₹{(data.analysis.categoryBreakdown?.[data.analysis.categories[0]] || 0).toLocaleString('en-IN')}
                    </div>
                    <p className={`text-sm ${isDark ? 'text-red-300' : 'text-gray-600'}`}>
                      {((data.analysis.categoryBreakdown?.[data.analysis.categories[0]] || 0) / data.analysis.totalSpent * 100).toFixed(1)}% of spending
                    </p>
                  </div>
                )}

                {/* Category Count */}
                <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition border ${
                  isDark
                    ? 'bg-gradient-to-br from-indigo-900/30 to-indigo-800/30 border-indigo-700/30 hover:border-indigo-600/50'
                    : 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className={`text-lg font-bold ${isDark ? 'text-indigo-300' : 'text-gray-900'}`}>
                      Categories
                    </h4>
                    <span className="text-2xl">📂</span>
                  </div>
                  <div className={`text-4xl font-bold mb-2 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                    {data.analysis?.categories?.length || 0}
                  </div>
                  <p className={`text-sm mb-4 ${isDark ? 'text-indigo-300' : 'text-gray-600'}`}>
                    Active categories (by spending)
                  </p>
                  <div className={`text-xs space-y-2 ${isDark ? 'text-indigo-200' : 'text-gray-500'}`}>
                    {data.analysis?.categories && data.analysis.categories.length > 0 ? (
                      data.analysis.categories.slice(0, 5).map((cat) => {
                        const amount = data.analysis.categoryBreakdown?.[cat] || 0;
                        const percentage = data.analysis.totalSpent > 0 
                          ? ((amount / data.analysis.totalSpent) * 100).toFixed(1)
                          : 0;
                        return (
                          <div key={cat} className={`flex justify-between items-center capitalize p-2 rounded-lg ${
                            isDark
                              ? 'bg-indigo-800/30'
                              : 'bg-white bg-opacity-50'
                          }`}>
                            <span className={`font-medium ${isDark ? 'text-indigo-300' : 'text-gray-700'}`}>
                              {cat}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className={isDark ? 'text-indigo-200' : 'text-gray-600'}>
                                ₹{amount.toLocaleString('en-IN')}
                              </span>
                              <span className={isDark ? 'text-indigo-400 font-bold' : 'text-indigo-600 font-semibold'}>
                                ({percentage}%)
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className={isDark ? 'text-indigo-400' : 'text-gray-500'}>
                        No categories available
                      </p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <p className={`text-center ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                No KPI data available
              </p>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Personalized Recommendations
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className={`animate-spin rounded-full h-12 w-12 border-4 border-t-blue-500 mx-auto ${
                  isDark ? 'border-slate-600' : 'border-slate-200'
                }`}></div>
                <p className={`mt-4 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  Loading recommendations...
                </p>
              </div>
            ) : data ? (
              <div className="space-y-6">
                
                {/* Alerts Section */}
                {data.alerts && data.alerts.length > 0 && (
                  <div className="space-y-4">
                    <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      ⚠️ Alerts
                    </h4>
                    <div className="space-y-3">
                      {data.alerts.map((alert, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-xl border-l-4 transition-all ${
                            alert.severity === 'high' 
                              ? isDark
                                ? 'bg-red-900/30 border-red-600/50 text-red-300'
                                : 'bg-red-50 border-red-400 text-red-800'
                              : alert.severity === 'medium'
                              ? isDark
                                ? 'bg-orange-900/30 border-orange-600/50 text-orange-300'
                                : 'bg-orange-50 border-orange-400 text-orange-800'
                              : isDark
                              ? 'bg-yellow-900/30 border-yellow-600/50 text-yellow-300'
                              : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                          }`}
                        >
                          <h5 className="font-bold mb-1">
                            {alert.type?.replace(/_/g, ' ') || 'Alert'}
                          </h5>
                          <p className="text-sm">{alert.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Recommendations */}
                {data.recommendations && data.recommendations.length > 0 && (
                  <div className="space-y-4">
                    <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      💡 Actionable Recommendations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.recommendations.map((rec, idx) => (
                        <div 
                          key={idx}
                          className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition border ${
                            isDark
                              ? 'bg-gradient-to-br from-blue-900/30 to-blue-800/30 border-blue-700/30 hover:border-blue-600/50'
                              : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-3xl">
                              {rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'}
                            </div>
                            <div className="flex-1">
                              <h5 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {idx + 1}. {rec.title}
                              </h5>
                              <p className={`text-sm mb-3 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                                {rec.description}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                  rec.priority === 'high' 
                                    ? isDark
                                      ? 'bg-red-900/50 text-red-300'
                                      : 'bg-red-200 text-red-800'
                                    : rec.priority === 'medium'
                                    ? isDark
                                      ? 'bg-orange-900/50 text-orange-300'
                                      : 'bg-orange-200 text-orange-800'
                                    : isDark
                                    ? 'bg-green-900/50 text-green-300'
                                    : 'bg-green-200 text-green-800'
                                }`}>
                                  {rec.priority?.toUpperCase() || 'MEDIUM'} PRIORITY
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Insights Section */}
                {data.insights && data.insights.length > 0 && (
                  <div className="space-y-4">
                    <h4 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      📊 Financial Insights
                    </h4>
                    <div className={`p-6 rounded-2xl shadow-md border ${
                      isDark
                        ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-700/30 space-y-3'
                        : 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 space-y-3'
                    }`}>
                      {data.insights.map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className={`text-xl flex-shrink-0 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                            ✓
                          </span>
                          <p className={isDark ? 'text-slate-100' : 'text-gray-800'}>
                            {insight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary Recommendations */}
                <div className={`p-6 rounded-2xl shadow-md border ${
                  isDark
                    ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-700/30'
                    : 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200'
                }`}>
                  <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    📋 Summary
                  </h4>
                  <div className={`space-y-3 ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>
                    <p>
                      <span className="font-bold">Overall Assessment:</span> {data.summary}
                    </p>
                    <p>
                      <span className="font-bold">Health Score:</span> {data.overallScore ?? 0}/100
                    </p>
                    <p>
                      <span className="font-bold">Next Steps:</span> Focus on the high-priority recommendations above to improve your financial health score.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <p className={`text-center ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                No recommendations available
              </p>
            )}
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Market Data & Economic Indicators
            </h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className={`animate-spin rounded-full h-8 w-8 border-4 border-t-blue-500 mx-auto ${
                  isDark ? 'border-slate-600' : 'border-slate-200'
                }`}></div>
                <p className={`mt-4 font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  Loading market data...
                </p>
              </div>
            ) : marketData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Market Indices */}
                <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition border ${
                  isDark
                    ? 'bg-slate-700/50 border-slate-600/30'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Major Indices
                  </h4>
                  <div className="space-y-3">
                    {Array.isArray(marketData.marketData?.indices) && marketData.marketData.indices.length > 0 ? (
                      marketData.marketData.indices.map((index) => (
                      <div key={index.symbol} className={`p-3 rounded-lg ${
                        isDark
                          ? 'bg-slate-800/50 border border-slate-700/30'
                          : 'bg-white border border-slate-200'
                      }`}>
                        <div className="flex justify-between items-center mb-1">
                          <div>
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {index.name}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                              {index.symbol}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              ${index.price?.toFixed(2)}
                            </p>
                            <p className={`text-sm ${index.change >= 0 ? (isDark ? 'text-green-400' : 'text-green-600') : (isDark ? 'text-red-400' : 'text-red-600')}`}>
                              {index.change >= 0 ? '+' : ''}{index.change?.toFixed(2)} ({index.changePercent?.toFixed(2)}%)
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                    ) : (
                      <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>No index data available</p>
                    )}
                  </div>
                </div>

                {/* Economic Indicators */}
                <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition border ${
                  isDark
                    ? 'bg-slate-700/50 border-slate-600/30'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Economic Indicators
                  </h4>
                  <div className="space-y-3">
                    {marketData.marketData?.economic ? (
                      <>
                        <div className="flex justify-between py-2 border-b" style={{borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgb(226, 232, 240)'}}>
                          <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                            Inflation Rate
                          </span>
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {marketData.marketData.economic.inflation?.value || 'N/A'}
                            {marketData.marketData.economic.inflation?.unit || '%'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgb(226, 232, 240)'}}>
                          <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                            Unemployment
                          </span>
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {marketData.marketData.economic.unemployment?.value || 'N/A'}
                            {marketData.marketData.economic.unemployment?.unit || '%'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgb(226, 232, 240)'}}>
                          <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                            GDP Growth
                          </span>
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {marketData.marketData.economic.gdp?.value || 'N/A'}
                            {marketData.marketData.economic.gdp?.unit || '%'}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>
                            Interest Rate
                          </span>
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {marketData.marketData.economic.interestRate?.value || 'N/A'}
                            {marketData.marketData.economic.interestRate?.unit || '%'}
                          </span>
                        </div>
                      </>
                    ) : <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>No economic data available</p>}
                  </div>
                </div>

                {/* Exchange Rates */}
                <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition border ${
                  isDark
                    ? 'bg-slate-700/50 border-slate-600/30'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Exchange Rates
                  </h4>
                  <div className="space-y-3">
                    {marketData.exchangeRates?.rates ? (
                      <>
                        <div className="flex justify-between py-2 border-b" style={{borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgb(226, 232, 240)'}}>
                          <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>USD/INR</span>
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ₹{(marketData.exchangeRates.rates.INR ?? 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgb(226, 232, 240)'}}>
                          <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>EUR/USD</span>
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ${(marketData.exchangeRates.rates.EUR ?? 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2 border-b" style={{borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgb(226, 232, 240)'}}>
                          <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>GBP/USD</span>
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ${(marketData.exchangeRates.rates.GBP ?? 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className={isDark ? 'text-slate-300' : 'text-gray-600'}>JPY/USD</span>
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ¥{(marketData.exchangeRates.rates.JPY ?? 0).toFixed(2)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                        No exchange rate data available
                      </p>
                    )}
                  </div>
                </div>

                {/* Financial News */}
                <div className={`p-6 rounded-2xl shadow-md hover:shadow-lg transition border md:col-span-2 lg:col-span-3 ${
                  isDark
                    ? 'bg-slate-700/50 border-slate-600/30'
                    : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Latest Financial News
                    </h4>
                    <select
                      value={newsFilter}
                      onChange={(e) => {
                        setNewsFilter(e.target.value);
                        setNewsPage(0);
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isDark
                          ? 'bg-slate-800/50 border border-slate-600/30 text-white'
                          : 'bg-white border border-slate-300 text-gray-900'
                      }`}
                    >
                      <option value="all">All News</option>
                      <option value="finance">Finance</option>
                      <option value="tech">Technology</option>
                      <option value="markets">Markets</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    {Array.isArray(marketData.news) && marketData.news.length > 0 ? (
                      <>
                        {marketData.news.slice(newsPage * 5, (newsPage + 1) * 5).map((article, index) => (
                          <div 
                            key={index} 
                            className={`p-4 rounded-lg border-b-2 last:border-b-0 hover:bg-opacity-50 transition cursor-pointer ${
                              isDark
                                ? 'border-slate-600/30 hover:bg-slate-700/50'
                                : 'border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <h5 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {article.title}
                            </h5>
                            {article.description && (
                              <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                                {article.description}
                              </p>
                            )}
                            <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                              {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                            </p>
                            {article.url && article.url !== '#' && (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-xs font-medium mt-2 inline-block transition-colors ${
                                  isDark
                                    ? 'text-blue-400 hover:text-blue-300'
                                    : 'text-blue-600 hover:text-blue-800'
                                }`}
                              >
                                Read More →
                              </a>
                            )}
                          </div>
                        ))}
                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t" style={{borderColor: isDark ? 'rgba(100, 116, 139, 0.3)' : 'rgb(226, 232, 240)'}}>
                          <button
                            onClick={() => setNewsPage(Math.max(0, newsPage - 1))}
                            disabled={newsPage === 0}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isDark
                                ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50 disabled:bg-slate-700 disabled:text-slate-500'
                                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500'
                            }`}
                          >
                            ← Previous
                          </button>
                          <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                            Page {newsPage + 1} of {Math.ceil(marketData.news.length / 5)}
                          </span>
                          <button
                            onClick={() => setNewsPage(newsPage + 1)}
                            disabled={(newsPage + 1) * 5 >= marketData.news.length}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isDark
                                ? 'bg-blue-900/50 text-blue-300 hover:bg-blue-800/50 disabled:bg-slate-700 disabled:text-slate-500'
                                : 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500'
                            }`}
                          >
                            Next →
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className={isDark ? 'text-slate-400' : 'text-gray-500'}>
                        No news available
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className={`text-center py-8 rounded-2xl ${
                isDark
                  ? 'bg-slate-700/50 border border-slate-600/30'
                  : 'bg-slate-50 border border-slate-200'
              }`}>
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>
                  Market data will be displayed here
                </p>
                <button 
                  onClick={fetchMarketData}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all hover:shadow-lg"
                >
                  Load Market Data
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialAnalytics;