# AI-Powered Financial Advice System

## Overview

FinAdvisor uses Google Gemini AI to provide intelligent financial advice and analysis based on user spending patterns and queries.

## How It Works

### 1. AI Query Processing

**Location**: `backend/routes/ai.js` and `backend/services/geminiAI.js`

Users submit financial questions or queries through the chat interface. The AI system processes these queries to provide contextual financial advice.

```
User Query → Backend → Gemini AI → Response
```

### 2. AI Service (geminiAI.js)

The main AI service integrates with Google Gemini API:

- **Initialization**: Connects to Google Gemini API using API key from environment
- **Query Processing**: Sends user questions to Gemini with system prompts for financial context
- **Response Generation**: Returns AI-generated financial advice

**Key Features**:

- Streaming responses for real-time feedback
- Context-aware financial recommendations
- Multi-turn conversation support

### 3. Transaction Analyzer

**Location**: `backend/services/transactionAnalyzer.js`

Analyzes user spending patterns to provide personalized insights:

- Categorizes expenses
- Identifies spending trends
- Calculates spending patterns by category
- Detects unusual spending habits

### 4. Rule Engine

**Location**: `backend/services/ruleEngine.js`

Implements financial rules for personalized recommendations:

- Evaluates spending against budget rules
- Generates automated suggestions
- Alerts on unusual spending
- Provides category-specific tips

### 5. Frontend AI Chat

**Location**: `frontend/src/components/AIChat.jsx`

User interface for AI interactions:

- Chat message interface
- Real-time message streaming
- Context from user expenses
- Conversation history

## Data Flow

```
1. User enters expense or query
   ↓
2. Frontend sends to backend
   ↓
3. Backend analyzes context (spending patterns, transaction history)
   ↓
4. Gemini AI processes with context
   ↓
5. Transaction Analyzer & Rule Engine provide insights
   ↓
6. Recommendations generated
   ↓
7. Response sent to frontend
   ↓
8. User receives AI advice
```

## AI Capabilities

### Financial Advice

- Budget planning and optimization
- Spending pattern analysis
- Saving strategy recommendations
- Financial goal guidance

### Personalized Recommendations

- Category-specific tips based on spending
- Alerts for unusual spending patterns
- Money-saving suggestions
- Budget adjustment recommendations

### Contextual Understanding

- Analyzes actual user expenses
- Considers spending trends
- Provides tailored advice based on habits
- Machine learning-based pattern recognition

## Setup Requirements

### Environment Variables

Create a `.env` file in the `backend/` directory:

```
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

### Obtaining Gemini API Key

1. Visit [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Create a new API key
3. Copy and paste into `.env` file

## API Endpoints

### POST `/api/ai/query`

Sends a financial query to the AI

**Request**:

```json
{
  "message": "How can I reduce my spending?"
}
```

**Response**:

```json
{
  "response": "Based on your spending patterns...",
  "recommendations": [...]
}
```

### POST `/api/ai/analyze`

Analyzes spending patterns and provides insights

**Response**:

```json
{
  "analysis": "Your spending has increased by...",
  "trends": {...},
  "suggestions": [...]
}
```

## Technical Stack

- **AI Model**: Google Gemini
- **Backend**: Node.js, Express
- **Database**: MongoDB (for expense and query storage)
- **Frontend**: React with Vite
- **Real-time**: WebSocket/HTTP Streaming

## Future Enhancements

- Multi-language support for financial advice
- Advanced predictive analytics
- Integration with additional AI models
- Real-time portfolio analysis
- Automated financial planning
