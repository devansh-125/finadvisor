import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const FinancialAnalytics = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [marketData, setMarketData] = useState(null);
  const [newsPage, setNewsPage] = useState(0);
  const [newsFilter, setNewsFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Simple API call for now - will expand later
      const response = await axios.get('http://localhost:5000/api/ai/health-analysis', { withCredentials: true });
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
      const response = await axios.get('http://localhost:5000/api/ai/market-data');
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
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-center mt-4">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Please Log In</h2>
          <p className="text-gray-600">You need to be logged in to view financial analytics.</p>
          <button
            onClick={() => window.location.href = '/login'}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold">Financial Analytics Dashboard</h2>
        <p className="text-blue-100 mt-1">Advanced insights into your financial health</p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {['overview', 'kpis', 'recommendations', 'market'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Financial Health Overview</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4">Loading your financial overview...</p>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Main Score Card */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-8 text-white lg:col-span-1 lg:row-span-2">
                  <h4 className="text-sm font-semibold opacity-90 mb-2">Overall Health Score</h4>
                  <div className="text-6xl font-bold mb-4">{data.overallScore ?? 0}</div>
                  <div className="w-full bg-blue-300 rounded-full h-3 mb-4">
                    <div
                      className="bg-white rounded-full h-3 transition-all"
                      style={{ width: `${data.overallScore ?? 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm opacity-90">out of 100</p>
                  <div className="mt-6 pt-6 border-t border-blue-400">
                    <p className="text-sm">
                      {data.overallScore >= 80 ? '✓ Excellent' : data.overallScore >= 60 ? '⚠ Good' : '✗ Needs Improvement'}
                    </p>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 lg:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Your Summary</h4>
                  <p className="text-gray-700 leading-relaxed">{data.summary || 'Your financial health overview'}</p>
                </div>

                {/* Spending Breakdown */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending</h4>
                  <div className="text-3xl font-bold text-gray-900 mb-2">₹{(data.analysis?.totalSpent || 0).toLocaleString('en-IN')}</div>
                  <p className="text-sm text-gray-600">Total expenses this month</p>
                  <div className="mt-4 pt-4 border-t">
                    <h5 className="text-sm font-semibold text-gray-900 mb-3">Top Categories</h5>
                    {data.analysis?.categories && data.analysis.categories.length > 0 ? (
                      <div className="space-y-2">
                        {data.analysis.categories.slice(0, 3).map((cat, idx) => {
                          const amount = data.analysis.categoryBreakdown?.[cat] || 0;
                          const percentage = data.analysis.totalSpent > 0 
                            ? ((amount / data.analysis.totalSpent) * 100).toFixed(0)
                            : 0;
                          return (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">{cat}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {percentage}%
                                </span>
                                <span className="text-xs text-gray-500">₹{amount}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No spending data available</p>
                    )}
                  </div>
                </div>

                {/* Health Score Breakdown */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Savings Rate</span>
                        <span className="text-sm font-semibold text-gray-900">{renderSafeValue(data.kpis?.savingsRate?.rate, 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2 transition-all"
                          style={{ width: `${Math.min(renderSafeValue(data.kpis?.savingsRate?.rate, 0), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Expense Ratio</span>
                        <span className="text-sm font-semibold text-gray-900">{renderSafeValue(data.kpis?.expenseRatio?.ratio, 0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
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

                {/* Recommendations Card */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 lg:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">💡 Quick Recommendations</h4>
                  <ul className="space-y-2">
                    {data.recommendations?.slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold mr-3 flex-shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-gray-700">
                          {rec.recommendation || rec.description || `Recommendation ${idx + 1}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">No financial data available</p>
                <button 
                  onClick={fetchData}
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Load Financial Data
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'kpis' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Key Performance Indicators</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4">Loading your KPIs...</p>
              </div>
            ) : data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Savings Rate */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Savings Rate</h4>
                    <span className="text-2xl">💰</span>
                  </div>
                  <div className="text-4xl font-bold text-green-600 mb-2">{renderSafeValue(data.kpis?.savingsRate?.rate, 0)}%</div>
                  <p className="text-sm text-gray-600 mb-4">
                    {(() => {
                      const status = data.kpis?.savingsRate?.status;
                      if (status === 'excellent') return '✓ Excellent';
                      if (status === 'good') return '• Good';
                      if (status === 'fair') return '• Fair';
                      return '✗ Low';
                    })()}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-green-500 rounded-full h-3 transition-all" 
                      style={{ width: `${Math.min(renderSafeValue(data.kpis?.savingsRate?.rate, 0), 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Expense Ratio */}
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Expense Ratio</h4>
                    <span className="text-2xl">📊</span>
                  </div>
                  <div className="text-4xl font-bold text-orange-600 mb-2">{renderSafeValue(data.kpis?.expenseRatio?.ratio, 0)}%</div>
                  <p className="text-sm text-gray-600 mb-4">
                    {(() => {
                      const status = data.kpis?.expenseRatio?.status;
                      if (status === 'excellent' || status === 'healthy') return '✓ Healthy';
                      if (status === 'good') return '✓ Good';
                      if (status === 'fair' || status === 'moderate') return '• Moderate';
                      return '✗ High';
                    })()}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-orange-500 rounded-full h-3 transition-all" 
                      style={{ width: `${Math.min(renderSafeValue(data.kpis?.expenseRatio?.ratio, 0), 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Monthly Spending */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Monthly Avg</h4>
                    <span className="text-2xl">📈</span>
                  </div>
                  <div className="text-4xl font-bold text-blue-600 mb-2">₹{(data.analysis?.totalSpent || 0).toLocaleString('en-IN')}</div>
                  <p className="text-sm text-gray-600 mb-4">Total spending</p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-blue-500 rounded-full h-3" 
                      style={{ width: `${Math.min((renderSafeValue(data.kpis?.expenseRatio?.ratio, 0)), 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Health Score */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Health Score</h4>
                    <span className="text-2xl">❤️</span>
                  </div>
                  <div className="text-4xl font-bold text-purple-600 mb-2">{data.overallScore ?? 0}</div>
                  <p className="text-sm text-gray-600 mb-4">
                    {data.overallScore >= 80 ? '✓ Excellent' : data.overallScore >= 60 ? '• Good' : '✗ Needs Work'}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-purple-500 rounded-full h-3 transition-all" 
                      style={{ width: `${Math.min(data.overallScore ?? 0, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Top Spending Category */}
                {data.analysis?.categories?.length > 0 && (
                  <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">Top Category</h4>
                      <span className="text-2xl">🏆</span>
                    </div>
                    <div className="text-3xl font-bold text-red-600 mb-2 capitalize">
                      {data.analysis.categories[0]}
                    </div>
                    <div className="text-2xl font-semibold text-gray-800 mb-2">
                      ₹{(data.analysis.categoryBreakdown?.[data.analysis.categories[0]] || 0).toLocaleString('en-IN')}
                    </div>
                    <p className="text-sm text-gray-600">
                      {((data.analysis.categoryBreakdown?.[data.analysis.categories[0]] || 0) / data.analysis.totalSpent * 100).toFixed(1)}% of spending
                    </p>
                  </div>
                )}

                {/* Category Count */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Categories</h4>
                    <span className="text-2xl">📂</span>
                  </div>
                  <div className="text-4xl font-bold text-indigo-600 mb-2">
                    {data.analysis?.categories?.length || 0}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Active categories (by spending)</p>
                  <div className="text-xs text-gray-500 space-y-2">
                    {data.analysis?.categories && data.analysis.categories.length > 0 ? (
                      data.analysis.categories.slice(0, 5).map((cat) => {
                        const amount = data.analysis.categoryBreakdown?.[cat] || 0;
                        const percentage = data.analysis.totalSpent > 0 
                          ? ((amount / data.analysis.totalSpent) * 100).toFixed(1)
                          : 0;
                        return (
                          <div key={cat} className="flex justify-between items-center capitalize bg-white bg-opacity-50 p-2 rounded">
                            <span className="font-medium text-gray-700">{cat}</span>
                            <div className="flex items-center gap-1">
                              <span className="text-gray-600">₹{amount.toLocaleString('en-IN')}</span>
                              <span className="text-indigo-600 font-semibold">({percentage}%)</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-gray-500">No categories available</p>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-center text-gray-600">No KPI data available</p>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900">Personalized Recommendations</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4">Loading recommendations...</p>
              </div>
            ) : data ? (
              <div className="space-y-6">
                
                {/* Alerts Section */}
                {data.alerts && data.alerts.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-xl font-semibold text-gray-900">⚠️ Alerts</h4>
                    <div className="space-y-3">
                      {data.alerts.map((alert, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 rounded-lg border-l-4 ${
                            alert.severity === 'high' 
                              ? 'bg-red-50 border-red-400 text-red-800'
                              : alert.severity === 'medium'
                              ? 'bg-orange-50 border-orange-400 text-orange-800'
                              : 'bg-yellow-50 border-yellow-400 text-yellow-800'
                          }`}
                        >
                          <h5 className="font-semibold mb-1">
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
                    <h4 className="text-xl font-semibold text-gray-900">💡 Actionable Recommendations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.recommendations.map((rec, idx) => (
                        <div 
                          key={idx}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-start gap-4">
                            <div className="text-3xl">
                              {rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-2">{idx + 1}. {rec.title}</h5>
                              <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                  rec.priority === 'high' 
                                    ? 'bg-red-200 text-red-800'
                                    : rec.priority === 'medium'
                                    ? 'bg-orange-200 text-orange-800'
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
                    <h4 className="text-xl font-semibold text-gray-900">📊 Financial Insights</h4>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 space-y-3">
                      {data.insights.map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="text-green-600 text-xl">✓</span>
                          <p className="text-gray-800">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary Recommendations */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border border-purple-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">📋 Summary</h4>
                  <div className="space-y-3 text-gray-800">
                    <p>
                      <span className="font-semibold">Overall Assessment:</span> {data.summary}
                    </p>
                    <p>
                      <span className="font-semibold">Health Score:</span> {data.overallScore ?? 0}/100
                    </p>
                    <p>
                      <span className="font-semibold">Next Steps:</span> Focus on the high-priority recommendations above to improve your financial health score.
                    </p>
                  </div>
                </div>

              </div>
            ) : (
              <p className="text-center text-gray-600">No recommendations available</p>
            )}
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Market Data & Economic Indicators</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4">Loading market data...</p>
              </div>
            ) : marketData ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Market Indices */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">Major Indices</h4>
                  <div className="space-y-3">
                    {marketData.marketData?.indices?.map((index) => (
                      <div key={index.symbol} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-gray-900">{index.name}</p>
                          <p className="text-sm text-gray-500">{index.symbol}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">${index.price?.toFixed(2)}</p>
                          <p className={`text-sm ${index.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {index.change >= 0 ? '+' : ''}{index.change?.toFixed(2)} ({index.changePercent?.toFixed(2)}%)
                          </p>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No index data available</p>}
                  </div>
                </div>

                {/* Economic Indicators */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">Economic Indicators</h4>
                  <div className="space-y-3">
                    {marketData.marketData?.economic && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Inflation Rate</span>
                          <span className="font-semibold">
                            {marketData.marketData.economic.inflation?.value || 'N/A'}
                            {marketData.marketData.economic.inflation?.unit || '%'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unemployment</span>
                          <span className="font-semibold">
                            {marketData.marketData.economic.unemployment?.value || 'N/A'}
                            {marketData.marketData.economic.unemployment?.unit || '%'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">GDP Growth</span>
                          <span className="font-semibold">
                            {marketData.marketData.economic.gdp?.value || 'N/A'}
                            {marketData.marketData.economic.gdp?.unit || '%'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Interest Rate</span>
                          <span className="font-semibold">
                            {marketData.marketData.economic.interestRate?.value || 'N/A'}
                            {marketData.marketData.economic.interestRate?.unit || '%'}
                          </span>
                        </div>
                      </>
                    ) || <p className="text-gray-500">No economic data available</p>}
                  </div>
                </div>

                {/* Exchange Rates */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold mb-4 text-gray-900">Exchange Rates</h4>
                  <div className="space-y-3">
                    {marketData.exchangeRates?.rates ? (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">USD/INR</span>
                          <span className="font-semibold">₹{(marketData.exchangeRates.rates.INR ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">EUR/USD</span>
                          <span className="font-semibold">${(marketData.exchangeRates.rates.EUR ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">GBP/USD</span>
                          <span className="font-semibold">${(marketData.exchangeRates.rates.GBP ?? 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">JPY/USD</span>
                          <span className="font-semibold">¥{(marketData.exchangeRates.rates.JPY ?? 0).toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500">No exchange rate data available</p>
                    )}
                  </div>
                </div>

                {/* Financial News */}
                <div className="bg-white p-6 rounded-lg border border-gray-200 md:col-span-2 lg:col-span-3">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">Latest Financial News</h4>
                    <select
                      value={newsFilter}
                      onChange={(e) => {
                        setNewsFilter(e.target.value);
                        setNewsPage(0);
                      }}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="all">All News</option>
                      <option value="finance">Finance</option>
                      <option value="tech">Technology</option>
                      <option value="markets">Markets</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    {marketData.news && marketData.news.length > 0 ? (
                      <>
                        {marketData.news.slice(newsPage * 5, (newsPage + 1) * 5).map((article, index) => (
                          <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0 hover:bg-gray-50 p-2 rounded cursor-pointer">
                            <h5 className="font-medium text-gray-900">{article.title}</h5>
                            {article.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{article.description}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {article.source} • {new Date(article.publishedAt).toLocaleDateString()}
                            </p>
                            {article.url && article.url !== '#' && (
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-block"
                              >
                                Read More →
                              </a>
                            )}
                          </div>
                        ))}
                        {/* Pagination */}
                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <button
                            onClick={() => setNewsPage(Math.max(0, newsPage - 1))}
                            disabled={newsPage === 0}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:bg-gray-300"
                          >
                            ← Previous
                          </button>
                          <span className="text-sm text-gray-600">
                            Page {newsPage + 1} of {Math.ceil(marketData.news.length / 5)}
                          </span>
                          <button
                            onClick={() => setNewsPage(newsPage + 1)}
                            disabled={(newsPage + 1) * 5 >= marketData.news.length}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:bg-gray-300"
                          >
                            Next →
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-500">No news available</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Market data will be displayed here</p>
                <button 
                  onClick={fetchMarketData}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
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