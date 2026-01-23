# FinAdvisor - AI-Powered Financial Advisor

A full-stack JavaScript application that uses AI to provide personalized financial advice while tracking expenses and analyzing spending patterns.

## ✨ Features

- **Expense Tracking**: Categorize and track daily expenses
- **AI Financial Intelligence**: Query GPT-4 Turbo for financial advice via OpenRouter
- **Personalized Recommendations**: Tailored advice based on spending habits
- **Analytics Dashboard**: Visualize spending trends and financial metrics
- **User Profiles**: Manage income, savings, and financial goals
- **Secure Authentication**: JWT and Google OAuth
- **AI Chat History**: Persistent conversation history
- **Modern UI**: Glassmorphic design with responsive interface

## 🛠️ Tech Stack

### Backend

- Node.js 18+, Express 5.2+
- MongoDB with Mongoose
- JWT, bcryptjs for security
- OpenRouter API (GPT-4 Turbo)
- Passport.js for OAuth

### Frontend

- React 18 with hooks
- Vite for builds
- Tailwind CSS 3
- React Router 6
- Context API for state
- Axios for API calls

### AI & Analytics

- OpenRouter API (GPT-4 Turbo)
- Transaction analysis engine
- Rule-based recommendation system
- Financial predictive analytics

## 📁 Project Structure

```
finadvisor/
├── backend/
│   ├── index.js
│   ├── package.json
│   ├── config/passport.js
│   ├── middleware/auth.js
│   ├── models/ (User, Expense, AIQuery)
│   ├── routes/ (auth, expenses, ai)
│   └── services/ (AI, analytics, rules)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── src/
│   │   ├── components/ (AIChat, ExpenseForm, etc.)
│   │   ├── context/ (Auth, Theme)
│   │   └── pages/ (Dashboard, Login, etc.)
├── AI_EXPLANATION.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js v18+
- MongoDB (Atlas or local)
- OpenRouter API key
- Google OAuth credentials

### Installation

1. **Clone repo**

   ```bash
   git clone https://github.com/devansh-125/finadvisor.git
   cd finadvisor
   ```

2. **Backend setup**

   ```bash
   cd backend
   npm install
   ```

3. **Frontend setup**

   ```bash
   cd ../frontend
   npm install
   cd ..
   ```

4. **Environment config**
   Create `backend/.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/finadvisor
   JWT_SECRET=your_jwt_secret_min_32_chars
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   OPENROUTER_API_KEY=your_openrouter_api_key
   ```

### Database Setup

- **MongoDB Atlas**: Create cluster, get connection string
- **Local MongoDB**: Install and start locally

### API Keys

- **OpenRouter**: Get key from [openrouter.ai](https://openrouter.ai)
- **Google OAuth**: Setup in [Google Cloud Console](https://console.cloud.google.com)

### Running

1. **Backend** (Terminal 1):

   ```bash
   cd backend
   npm run dev
   ```

2. **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

Access at http://localhost:5173

## 📡 API Documentation

### Auth Endpoints

- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/profile` - User profile
- `POST /api/auth/logout` - Logout

### Expense Endpoints

- `GET /api/expenses` - Get expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### AI Endpoints

- `POST /api/ai/query` - Send AI query
- `GET /api/ai/history` - Get query history

### Example Requests

**Add Expense**:

```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"description":"Groceries","amount":5000,"category":"Food"}'
```

**AI Query**:

```bash
curl -X POST http://localhost:5000/api/ai/query \
  -H "Authorization: Bearer YOUR_JWT" \
  -H "Content-Type: application/json" \
  -d '{"question":"How to save money?"}'
```

## 🏗️ Production Build

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

### Backend

```bash
cd backend
npm start
```

## 🛠️ Development

### Scripts

- `npm run dev` - Dev server with hot-reload
- `npm run build` - Production build
- `npm run lint` - ESLint

### Environment Variables

| Variable             | Required | Description         |
| -------------------- | -------- | ------------------- |
| MONGO_URI            | Yes      | MongoDB connection  |
| JWT_SECRET           | Yes      | JWT signing key     |
| OPENROUTER_API_KEY   | Yes      | AI API key          |
| GOOGLE_CLIENT_ID     | Yes      | OAuth client ID     |
| GOOGLE_CLIENT_SECRET | Yes      | OAuth client secret |

## 🤝 Contributing

1. Fork repo
2. Create feature branch
3. Make changes
4. Commit with conventional messages
5. Open PR

## 📚 Documentation

- [AI System](./AI_EXPLANATION.md) - AI architecture details

## 🐛 Troubleshooting

- **MongoDB connection**: Check MONGO_URI
- **Port in use**: Change PORT or kill process
- **API key errors**: Verify OPENROUTER_API_KEY
- **CORS issues**: Ensure backend running

## 📄 License

ISC License

## 🌟 Status

- Version: 1.0.0
- Status: Active
- Maintainers: [devansh-125](https://github.com/devansh-125)

---

Made with ❤️ for smarter financial management 💰🤖
