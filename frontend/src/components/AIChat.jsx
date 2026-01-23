import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

const AIChat = () => {
  const { isDark, toggleTheme } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your financial advisor AI powered by GPT-4 Turbo. Ask me anything about your spending, budgeting, or financial goals.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [history, setHistory] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Fetch chat history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/ai/history`, { withCredentials: true });
      setHistory(response.data.conversations || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const loadConversation = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_URL}/api/ai/history/${id}`, { withCredentials: true });
      setConversationId(id);
      
      // Transform backend messages to frontend format
      const loadedMessages = (response.data.messages || []).flatMap((q, index) => [
        {
          id: `q-${index}`,
          type: 'user',
          content: q.question,
          timestamp: new Date(q.createdAt)
        },
        {
          id: `a-${index}`,
          type: 'ai',
          content: q.response,
          timestamp: new Date(q.createdAt),
          metadata: q.metadata
        }
      ]);
      
      setMessages(loadedMessages);
    } catch (err) {
      console.error('Error loading conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        id: 1,
        type: 'ai',
        content: 'Hello! I\'m your financial advisor AI powered by GPT-4 Turbo. Ask me anything about your spending, budgeting, or financial goals.',
        timestamp: new Date()
      }
    ]);
    setError('');
  };

  const deleteConversation = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      await axios.delete(`${API_URL}/api/ai/history/${id}`, { withCredentials: true });
      setHistory(prev => prev.filter(item => item._id !== id));
      if (conversationId === id) {
        startNewChat();
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle fullscreen toggle
  const toggleFullscreen = async () => {
    try {
      if (!isFullscreen) {
        // Request fullscreen
        const elem = chatContainerRef.current;
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }
        setIsFullscreen(true);
      } else {
        // Exit fullscreen
        if (document.fullscreenElement || document.webkitFullscreenElement) {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if (document.webkitExitFullscreen) {
            await document.webkitExitFullscreen();
          } else if (document.msExitFullscreen) {
            await document.msExitFullscreen();
          }
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen error:', err);
      setIsFullscreen(false);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

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
      const response = await axios.post(`${API_URL}/api/ai/query`,
        { 
          question: input,
          conversationId: conversationId 
        },
        { withCredentials: true }
      );

      // Update conversationId if it was a new chat
      if (!conversationId && response.data.conversationId) {
        setConversationId(response.data.conversationId);
        fetchHistory(); // Refresh history list to show the new chat
      }

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
      
      // Get detailed error information from backend
      let errorContent = '';
      
      if (err.response?.data?.error) {
        // New format with detailed error info
        const errorData = err.response.data.error;
        errorContent = `**Error (${errorData.code}):** ${errorData.message}\n\n`;
        if (errorData.details) {
          errorContent += `**Details:** ${errorData.details}\n\n`;
        }
        if (errorData.layer) {
          errorContent += `**Layer:** ${errorData.layer}`;
        }
      } else if (err.response?.data?.message) {
        // Fallback to old format
        errorContent = err.response.data.message;
      } else {
        errorContent = err.message || 'Failed to get response from AI';
      }
      
      const errorMessage = {
        id: messages.length + 2,
        type: 'error',
        content: errorContent || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setError(errorContent || 'Failed to get response from AI');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
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
    <div 
      ref={chatContainerRef}
      className={`flex transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50' : 'h-full'
      } ${
        isDark 
          ? 'bg-slate-900' 
          : 'bg-slate-50'
      }`}
    >
      {/* Sidebar - Your Chats */}
      <div className={`${
        isSidebarOpen ? 'w-full sm:w-64 absolute sm:relative z-20 h-full' : 'w-0'
      } transition-all duration-300 overflow-hidden flex flex-col border-r ${
        isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="p-4 border-b border-slate-700/30">
          <button
            onClick={startNewChat}
            className={`w-full py-3 px-4 rounded-xl border-2 border-dashed transition-all flex items-center justify-center gap-2 font-semibold ${
              isDark 
                ? 'border-blue-500/30 hover:border-blue-500/60 text-blue-400 hover:bg-blue-500/10' 
                : 'border-blue-200 hover:border-blue-400 text-blue-600 hover:bg-blue-50'
            }`}
          >
            <span>+</span> New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          <h3 className={`text-xs font-bold uppercase tracking-wider px-2 mb-2 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>
            Your Chats
          </h3>
          {history.length === 0 ? (
            <p className={`text-sm px-2 italic ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              No recent chats
            </p>
          ) : (
            history.map((chat) => (
              <div
                key={chat._id}
                onClick={() => loadConversation(chat._id)}
                className={`group relative p-3 rounded-xl cursor-pointer transition-all ${
                  conversationId === chat._id
                    ? isDark ? 'bg-blue-900/40 text-blue-200' : 'bg-blue-50 text-blue-700'
                    : isDark ? 'hover:bg-slate-700/50 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">💬</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {chat.title || 'New Conversation'}
                    </p>
                    <p className="text-[10px] opacity-50">
                      {new Date(chat.lastMessageAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => deleteConversation(e, chat._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 transition-all"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Sidebar Toggle Button (Mobile/Collapsed) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`absolute left-2 sm:left-4 z-30 p-2 sm:p-2 rounded-full shadow-lg transition-all ${
            isDark ? 'bg-slate-700 text-white' : 'bg-white text-slate-600'
          } ${isSidebarOpen ? 'sm:translate-x-64' : 'translate-x-0'} touch-manipulation`}
          style={{ top: '80px' }}
        >
          {isSidebarOpen ? '◀' : '▶'}
        </button>

        {/* Header with Glassmorphism */}
        <div className={`backdrop-blur-md border-b transition-all ${
          isDark
            ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 border-blue-700/30 shadow-2xl'
            : 'bg-gradient-to-r from-blue-600/90 to-blue-700/90 border-blue-400/20 shadow-lg'
        } text-white p-4 sm:p-6`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full blur opacity-75 animate-pulse"></div>
                  <div className={`relative w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-base sm:text-lg font-bold ${
                    isDark ? 'bg-blue-900' : 'bg-blue-600'
                  }`}>
                    🤖
                  </div>
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent truncate">
                    Financial Advisor AI
                  </h2>
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-blue-200/70' : 'text-blue-100'} hidden xs:block`}>
                    Powered by GPT-4 Turbo • Real-time financial insights
                  </p>
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div className="flex items-center gap-2 sm:gap-3 ml-2 sm:ml-4 flex-shrink-0">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${
                  isDark
                    ? 'bg-blue-800/50 hover:bg-blue-700/70 text-yellow-300'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
              
              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className={`p-2 rounded-lg transition-all hover:scale-110 ${
                  isDark
                    ? 'bg-blue-800/50 hover:bg-blue-700/70'
                    : 'bg-white/20 hover:bg-white/30'
                } text-white`}
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? '⊡' : '⛶'}
              </button>
            </div>
          </div>
        </div>

        {/* Messages Container with Modern Scroll */}
        <div className={`flex-1 overflow-y-auto p-3 sm:p-6 space-y-3 sm:space-y-4 scrollbar-thin ${
          isDark 
            ? 'scrollbar-thumb-blue-700 scrollbar-track-slate-800 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' 
            : 'scrollbar-thumb-blue-300 scrollbar-track-slate-100 bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'
        }`}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div
                className={`max-w-[85%] xs:max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg px-3 sm:px-5 py-3 sm:py-4 rounded-2xl transition-all hover:shadow-lg ${
                  message.type === 'user'
                    ? isDark
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none shadow-lg'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none shadow-md'
                    : message.type === 'error'
                    ? isDark
                      ? 'bg-red-900/30 border border-red-700/50 text-red-300 rounded-bl-none backdrop-blur'
                      : 'bg-red-100 border border-red-300 text-red-900 rounded-bl-none'
                    : isDark
                    ? 'bg-slate-700/50 border border-slate-600/50 text-slate-100 rounded-bl-none backdrop-blur shadow-lg'
                    : 'bg-white/90 border border-slate-200 text-gray-800 rounded-bl-none shadow-lg backdrop-blur'
                }`}
              >
                {message.type === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap font-medium">{message.content}</p>
                ) : (
                  <div className={`text-sm prose-sm max-w-none ${
                    isDark ? 'text-slate-100' : 'text-gray-800'
                  }`}>
                    <ReactMarkdown
                      components={{
                        h1: ({...props}) => <h1 className="text-lg font-bold mt-3 mb-2" {...props} />,
                        h2: ({...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                        h3: ({...props}) => <h3 className="text-sm font-semibold mt-2 mb-1" {...props} />,
                        p: ({...props}) => <p className="my-1" {...props} />,
                        ul: ({...props}) => <ul className="list-disc list-inside my-1 space-y-0.5" {...props} />,
                        ol: ({...props}) => <ol className="list-decimal list-inside my-1 space-y-0.5" {...props} />,
                        li: ({...props}) => <li className="ml-2" {...props} />,
                        strong: ({...props}) => <strong className="font-bold" {...props} />,
                        em: ({...props}) => <em className="italic" {...props} />,
                        code: ({...props}) => <code className={`px-1.5 py-0.5 rounded text-xs ${
                          isDark 
                            ? 'bg-slate-900/50 text-cyan-300' 
                            : 'bg-slate-100 text-blue-700'
                        }`} {...props} />,
                        pre: ({...props}) => <pre className={`p-2 rounded overflow-x-auto text-xs my-1 ${
                          isDark 
                            ? 'bg-slate-900/70 text-cyan-300' 
                            : 'bg-slate-100 text-gray-900'
                        }`} {...props} />,
                        hr: ({...props}) => <hr className="my-2" {...props} />,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
                <p className={`text-xs mt-2 ${
                  message.type === 'user'
                    ? 'text-blue-100'
                    : message.type === 'error'
                    ? isDark ? 'text-red-300' : 'text-red-600'
                    : isDark ? 'text-slate-300/60' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                {/* Enhanced Metadata */}
                {message.metadata && (
                  <div className={`mt-3 pt-3 border-t text-xs space-y-1 ${
                    isDark ? 'border-slate-600 text-slate-300' : 'border-gray-200 text-gray-600'
                  }`}>
                    <div className="grid grid-cols-2 gap-2">
                      {message.metadata.totalSpent && (
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-blue-50'}`}>
                          <p className="font-semibold">Spent</p>
                          <p>₹{message.metadata.totalSpent}</p>
                        </div>
                      )}
                      {message.metadata.healthScore && (
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-slate-800/50' : 'bg-green-50'}`}>
                          <p className="font-semibold">Score</p>
                          <p>{message.metadata.healthScore}/100</p>
                        </div>
                      )}
                    </div>
                    {message.metadata.model && (
                      <p className={`text-xs mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        🤖 {message.metadata.model}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-fadeIn">
              <div className={`px-5 py-4 rounded-2xl rounded-bl-none ${
                isDark
                  ? 'bg-slate-700/50 border border-slate-600/50 backdrop-blur'
                  : 'bg-white/90 border border-slate-200 backdrop-blur'
              }`}>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className={`text-xs mt-2 ${isDark ? 'text-slate-300' : 'text-gray-500'}`}>
                  ✨ GPT-4 Turbo is thinking...
                </p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Alert */}
        {error && (
          <div className={`mx-6 mb-4 px-4 py-3 rounded-xl border-l-4 backdrop-blur-sm ${
            isDark
              ? 'bg-red-900/30 border-red-700/50 text-red-300'
              : 'bg-red-50 border-red-500 text-red-700'
          }`}>
            <div className={`text-sm prose-sm max-w-none ${isDark ? 'text-red-300' : 'text-red-700'}`}>
              <ReactMarkdown
                components={{
                  strong: ({...props}) => <strong className="font-bold" {...props} />,
                  p: ({...props}) => <p className="my-1" {...props} />,
                }}
              >
                {error}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Input Form with Glassmorphism */}
        <form onSubmit={handleSendMessage} className={`backdrop-blur-md border-t transition-all ${
          isDark
            ? 'bg-slate-800/50 border-slate-700/50'
            : 'bg-white/50 border-slate-200'
        } p-3 sm:p-6 shadow-2xl`}>
          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              disabled={loading}
              className={`flex-1 px-3 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-all focus:outline-none focus:ring-2 text-sm sm:text-base ${
                isDark
                  ? 'bg-slate-700/50 border border-slate-600/50 text-white placeholder-slate-400 focus:ring-cyan-500/50 backdrop-blur'
                  : 'bg-white/80 border border-slate-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all hover:scale-105 disabled:scale-100 touch-manipulation ${
                isDark
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700'
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500'
              } text-white shadow-lg disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2`}
            >
              {loading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></span>
                  <span className="hidden sm:inline">Thinking</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Send</span>
                  <span>✈️</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="mt-3 sm:mt-4 flex flex-wrap gap-1.5 sm:gap-2">
            <QuickButton
              icon="💡"
              text="Reduce Spending"
              onClick={() => setInput('How can I reduce my spending?')}
              disabled={loading}
              isDark={isDark}
            />
            <QuickButton
              icon="📊"
              text="Spending Patterns"
              onClick={() => setInput('What are my spending patterns?')}
              disabled={loading}
              isDark={isDark}
            />
            <QuickButton
              icon="💰"
              text="Saving Strategy"
              onClick={() => setInput('What saving strategy should I follow?')}
              disabled={loading}
              isDark={isDark}
              className="hidden xs:inline-flex"
            />
            <QuickButton
              icon="🎯"
              text="Investment Goals"
              onClick={() => setInput('How should I invest my surplus?')}
              disabled={loading}
              isDark={isDark}
              className="hidden sm:inline-flex"
            />
            <button
              type="button"
              onClick={startNewChat}
              disabled={loading}
              className={`text-xs font-semibold px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all ml-auto touch-manipulation ${
                isDark
                  ? 'bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-700/30'
                  : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              🗑️ <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const QuickButton = ({ icon, text, onClick, disabled, isDark, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`text-xs font-semibold px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all backdrop-blur-sm touch-manipulation ${
      isDark
        ? 'bg-blue-900/40 hover:bg-blue-900/60 text-blue-200 border border-blue-700/40'
        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200'
    } disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {icon} <span className="hidden xs:inline">{text}</span>
  </button>
);

export default AIChat;
