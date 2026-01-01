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
      setData(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      // Provide sample data
      setData({
        overallScore: 75,
        summary: "Sample financial health analysis",
        kpis: {
          savingsRate: { rate: 18, status: 'good' },
          expenseRatio: { ratio: 72, status: 'fair' }
        },
        recommendations: [
          { recommendation: 'Track your expenses regularly', priority: 'high', kpi: 'tracking' }
        ]
      });
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
      // Provide sample market data
      setMarketData({
        marketData: {
          indices: [
            { symbol: 'SPY', name: 'S&P 500', price: 450.00, change: 2.50, changePercent: 0.56 },
            { symbol: 'QQQ', name: 'Nasdaq 100', price: 380.00, change: -1.20, changePercent: -0.31 },
            { symbol: 'IWM', name: 'Russell 2000', price: 180.00, change: 1.80, changePercent: 1.01 }
          ],
          economic: { inflation: 3.1, unemployment: 4.1, gdp: 2.3 }
        },
        news: [
          { title: 'Fed Signals Potential Rate Cuts', source: 'Reuters', publishedAt: new Date() },
          { title: 'Tech Stocks Rally on AI Optimism', source: 'Bloomberg', publishedAt: new Date() }
        ],
        exchangeRates: { USD_INR: 83.5, EUR_USD: 1.08 }
      });
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
                  <div className="text-6xl font-bold mb-4">{data.overallScore || 75}</div>
                  <div className="w-full bg-blue-300 rounded-full h-3 mb-4">
                    <div
                      className="bg-white rounded-full h-3 transition-all"
                      style={{ width: `${data.overallScore || 75}%` }}
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
                        <span className="text-sm font-semibold text-gray-900">{data.kpis?.savingsRate?.rate || 15}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 rounded-full h-2 transition-all"
                          style={{ width: `${Math.min(data.kpis?.savingsRate?.rate || 15, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600">Expense Ratio</span>
                        <span className="text-sm font-semibold text-gray-900">{data.kpis?.expenseRatio?.ratio || 75}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`rounded-full h-2 transition-all ${
                            (data.kpis?.expenseRatio?.ratio || 75) <= 70 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                          style={{ width: `${Math.min(data.kpis?.expenseRatio?.ratio || 75, 100)}%` }}
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
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Key Performance Indicators</h3>
            {loading ? (
              <p>Loading KPIs...</p>
            ) : (
              <p>KPIs will be displayed here</p>
            )}
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Personalized Recommendations</h3>
            {loading ? (
              <p>Loading recommendations...</p>
            ) : (
              <p>Recommendations will be displayed here</p>
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
                          <span className="font-semibold">₹{(marketData.exchangeRates.rates.INR || 83.5).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">EUR/USD</span>
                          <span className="font-semibold">${(marketData.exchangeRates.rates.EUR || 0.92).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">GBP/USD</span>
                          <span className="font-semibold">${(marketData.exchangeRates.rates.GBP || 0.79).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">JPY/USD</span>
                          <span className="font-semibold">¥{(marketData.exchangeRates.rates.JPY || 156.7).toFixed(2)}</span>
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