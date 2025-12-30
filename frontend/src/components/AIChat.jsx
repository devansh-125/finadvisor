import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const AIChat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your financial advisor AI. Ask me anything about your spending, budgeting, or financial goals.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      // Send question to AI backend
      const response = await axios.post('/api/ai/query', 
        { question: input },
        { withCredentials: true }
      );

      // Add AI response
      const aiMessage = {
        id: messages.length + 2,
        type: 'ai',
        content: response.data.response,
        timestamp: new Date(),
        metadata: response.data.metadata
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      const errorMessage = {
        id: messages.length + 2,
        type: 'error',
        content: err.response?.data?.message || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(err.response?.data?.message || 'Failed to get response from AI');
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: 'Hello! I\'m your financial advisor AI. Ask me anything about your spending, budgeting, or financial goals.',
        timestamp: new Date()
      }
    ]);
    setError('');
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold">Financial Advisor AI</h2>
        <p className="text-blue-100 mt-1">Ask questions about your finances</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800 rounded-bl-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-md'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-2 ${
                message.type === 'user'
                  ? 'text-blue-100'
                  : message.type === 'error'
                  ? 'text-red-600'
                  : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>

              {/* Show spending metadata for AI responses */}
              {message.metadata && (
                <div className="mt-3 pt-3 border-t border-gray-200 text-xs space-y-1">
                  <p><strong>Spending Summary:</strong></p>
                  <p>• Total Expenses: ₹{message.metadata.totalSpent}</p>
                  <p>• Last 30 Days: ₹{message.metadata.last30Days}</p>
                  <p>• Top Category: {message.metadata.topCategory}</p>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none shadow-md">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">AI is thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mx-6 mb-4 rounded">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="bg-white border-t border-gray-200 p-6 shadow-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your expenses, goals, or financial advice..."
            disabled={loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Sending
              </>
            ) : (
              <>
                <span>Send</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Action Buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInput('How can I reduce my spending?')}
            disabled={loading}
            className="text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-3 py-2 rounded transition disabled:cursor-not-allowed"
          >
            💡 How to reduce spending?
          </button>
          <button
            type="button"
            onClick={() => setInput('What are my spending patterns?')}
            disabled={loading}
            className="text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-3 py-2 rounded transition disabled:cursor-not-allowed"
          >
            📊 My spending patterns
          </button>
          <button
            type="button"
            onClick={() => setInput('How much should I save each month?')}
            disabled={loading}
            className="text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 px-3 py-2 rounded transition disabled:cursor-not-allowed"
          >
            💰 Saving goals
          </button>
          <button
            type="button"
            onClick={clearChat}
            disabled={loading}
            className="text-xs bg-red-50 hover:bg-red-100 disabled:bg-gray-50 text-red-700 px-3 py-2 rounded transition disabled:cursor-not-allowed ml-auto"
          >
            🗑️ Clear Chat
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
