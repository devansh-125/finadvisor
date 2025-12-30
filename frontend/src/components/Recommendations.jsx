import { useState, useEffect } from 'react';
import axios from 'axios';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('/api/ai/recommendations', { 
        withCredentials: true 
      });
      setRecommendations(response.data.recommendations || []);
      setInsights(response.data.insights || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError(err.response?.data?.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-50 border-l-4 border-red-500';
      case 'medium':
        return 'bg-yellow-50 border-l-4 border-yellow-500';
      case 'low':
        return 'bg-green-50 border-l-4 border-green-500';
      default:
        return 'bg-blue-50 border-l-4 border-blue-500';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <span className="inline-block bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-semibold">High Priority</span>;
      case 'medium':
        return <span className="inline-block bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-semibold">Medium Priority</span>;
      case 'low':
        return <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">Low Priority</span>;
      default:
        return <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">Informational</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-gray-600">Loading personalized recommendations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            <strong>Error:</strong> {error}
          </p>
          <button
            onClick={fetchRecommendations}
            className="mt-2 text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Insights Section */}
      {insights && insights.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-indigo-900 mb-4">💡 Key Insights</h3>
          <ul className="space-y-2">
            {insights.map((insight, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-indigo-600 mr-3">✓</span>
                <span className="text-indigo-800">{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations Section */}
      {recommendations && recommendations.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📋 Your Personalized Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((rec, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-4 cursor-pointer transition ${getPriorityColor(rec.priority)}`}
                onClick={() => setExpandedId(expandedId === idx ? null : idx)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{rec.title}</h4>
                      {getPriorityBadge(rec.priority)}
                    </div>
                    {expandedId === idx ? (
                      <p className="text-gray-700 text-sm leading-relaxed">{rec.description}</p>
                    ) : (
                      <p className="text-gray-600 text-sm line-clamp-2">{rec.description}</p>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0 text-xl">
                    {expandedId === idx ? '▼' : '▶'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <p className="text-gray-600">
            Start tracking your expenses to get personalized recommendations!
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchRecommendations}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition disabled:cursor-not-allowed"
        >
          🔄 Refresh Recommendations
        </button>
      </div>
    </div>
  );
};

export default Recommendations;
