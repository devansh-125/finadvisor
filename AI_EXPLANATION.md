# AI-Powered Financial Advisor System

## Overview

FinAdvisor uses GPT-4 Turbo via OpenRouter API to provide personalized financial advice based on user spending patterns and contextual queries.

## How It Works

### AI Processing Pipeline

1. **User Query** → Input validation
2. **Context Gathering** → Expense history analysis  
3. **AI Analysis** → GPT-4 Turbo processing
4. **Response Generation** → Personalized advice

### Core Components

- **OpenRouter Service** (`backend/services/openrouterService.js`): Primary AI integration with GPT-4 Turbo
- **Transaction Analyzer** (`backend/services/transactionAnalyzer.js`): Spending pattern analysis
- **Rule Engine** (`backend/services/ruleEngine.js`): Financial rule evaluation
- **Financial Analytics** (`backend/services/financialAnalytics.js`): Data aggregation and insights

### AI Capabilities

- **Financial Planning**: Budget optimization, goal-based planning
- **Predictive Intelligence**: Spending forecasting, market-adaptive advice
- **Personalized Recommendations**: Category analysis, behavioral insights
- **Contextual Understanding**: Multi-dimensional analysis with temporal patterns

## Technical Architecture

### Data Flow

```
User Query → Auth Middleware → Transaction Analysis → Rule Evaluation → AI Prompt Building → GPT-4 Processing → Response Streaming
```

### API Endpoints

- `POST /api/ai/query`: Send financial query to AI
- `GET /api/ai/history`: Retrieve AI conversation history

### Environment Setup

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_here
```

### Example Usage

**AI Query Request**:
```json
{
  "question": "How can I reduce my food expenses?",
  "context": {
    "includeHistory": true,
    "timeframe": "3months"
  }
}
```

**Response**:
```json
{
  "response": "Based on your spending data...",
  "recommendations": ["Cook at home more", "Plan weekly meals"],
  "metadata": {
    "model": "openai/gpt-4-turbo",
    "confidence": 0.92
  }
}
```

## Performance Features

- **Caching**: Response and analysis caching
- **Rate Limiting**: API quotas and burst handling
- **Error Handling**: Fallback providers and graceful degradation
- **Streaming**: Real-time response streaming

## Future Enhancements

- Multi-modal analysis (documents/images)
- Voice-enabled queries
- Real-time market integration
- Advanced ML models for personalization

---

*This AI system combines advanced AI with financial expertise for personalized guidance.*
