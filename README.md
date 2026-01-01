# FinAdvisor - AI-Powered Financial Advisor (2026)

A cutting-edge full-stack JavaScript application that leverages advanced AI technology to provide personalized financial advice while intelligently tracking daily expenses and offering actionable recommendations based on sophisticated spending pattern analysis.

## ✨ Core Features

- **Smart Expense Tracking**: Intelligent categorization and tracking of daily expenses with spending pattern analysis
- **AI Financial Intelligence**: Advanced financial queries powered by GPT-4 Turbo via OpenRouter API
- **Personalized Financial Advice**: Contextual recommendations tailored to individual spending habits and financial goals
- **Real-Time Analytics Dashboard**: Interactive visualization of spending trends, financial metrics, and insights
- **Advanced User Profiles**: Comprehensive personal financial management with income and savings tracking
- **Secure Authentication**: Multi-layer security with JWT tokens and Google OAuth 2.0 integration
- **Conversation History**: Persistent AI chat history for continuous financial guidance
- **Modern UI/UX**: 2026-style glassmorphic design with real-time updates and responsive interface

## 🛠️ Tech Stack (2026 Edition)

- **Backend**: 
  - Node.js 18+, Express 5.2+
  - MongoDB (Atlas/Local)
  - JWT, bcryptjs for security
  - OpenRouter API (GPT-4 Turbo)
  - Passport.js for OAuth authentication

- **Frontend**: 
  - React 18 with modern hooks
  - Vite for ultra-fast builds
  - Tailwind CSS 3 with animations
  - React Router 6 for navigation
  - Context API for state management
  - Axios for API communication

- **Database**: 
  - MongoDB with Mongoose ODM
  - Atlas Cloud or Local instances
  - Indexed queries for performance

- **AI & Analytics**: 
  - OpenRouter API (GPT-4 Turbo model)
  - Advanced transaction analysis engine
  - Intelligent rule-based recommendation system
  - Financial predictive analytics

## 📁 Project Architecture

```
finadvisor/
├── backend/                      # Node.js/Express API server
│   ├── .env                     # Environment configuration
│   ├── .env.example             # Example env variables
│   ├── index.js                 # Server entry point & initialization
│   ├── package.json             # Backend dependencies
│   ├── config/
│   │   └── passport.js          # OAuth authentication strategies
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── models/
│   │   ├── User.js              # User profile model
│   │   ├── Expense.js           # Expense tracking model
│   │   └── AIQuery.js           # AI interaction history model
│   ├── routes/
│   │   ├── auth.js              # Authentication endpoints
│   │   ├── expenses.js          # Expense CRUD operations
│   │   └── ai.js                # AI query & analysis endpoints
│   └── services/
│       ├── openrouterService.js # GPT-4 Turbo AI integration
│       ├── openaiService.js     # AI service wrapper/factory
│       ├── transactionAnalyzer.js # Spending pattern analysis
│       ├── ruleEngine.js        # Financial rule evaluation
│       ├── financialDataService.js # Data aggregation
│       └── financialAnalytics.js   # Analytics computations
│
├── frontend/                     # React/Vite client application
│   ├── .env                     # Frontend configuration
│   ├── package.json             # Frontend dependencies
│   ├── vite.config.js           # Vite build configuration
│   ├── tailwind.config.js       # Tailwind CSS customization
│   ├── index.html               # HTML entry point
│   ├── public/                  # Static assets
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Root component
│       ├── index.css            # Global styles
│       ├── App.css              # App-specific styles
│       ├── components/
│       │   ├── AIChat.jsx       # AI chat interface
│       │   ├── ExpenseForm.jsx  # Expense input form
│       │   ├── ExpenseList.jsx  # Expense display list
│       │   ├── FinancialAnalytics.jsx # Dashboard & charts
│       │   └── Recommendations.jsx    # AI recommendations UI
│       ├── context/
│       │   ├── AuthContext.jsx  # Authentication state
│       │   └── ThemeContext.jsx # Theme management
│       ├── pages/
│       │   ├── Login.jsx        # Modern login page (2026 UI)
│       │   ├── Dashboard.jsx    # Main dashboard
│       │   ├── Profile.jsx      # User profile management
│       │   └── Register.jsx     # Registration page
│       └── assets/              # Images & icons
│
├── AI_EXPLANATION.md            # Detailed AI system documentation
├── README.md                    # Project documentation (this file)
└── .gitignore                   # Git ignore rules
```

## 🚀 Quick Start Guide

### Prerequisites

- **Node.js**: v18 or higher ([Download](https://nodejs.org))
- **npm**: v9 or higher (comes with Node.js)
- **MongoDB**: Atlas account (free tier) or Local installation
- **Git**: For cloning the repository
- **OpenRouter API Key**: For AI features ([Get API Key](https://openrouter.ai))
- **Google OAuth Credentials**: For authentication ([OAuth Setup](https://console.cloud.google.com))

### 📥 Installation Steps

#### Step 1: Clone Repository

```bash
git clone https://github.com/devansh-125/finadvisor.git
cd finadvisor
```

#### Step 2: Backend Setup

```bash
cd backend
npm install
```

#### Step 3: Frontend Setup

```bash
cd ../frontend
npm install
cd ..
```

#### Step 4: Environment Configuration

Create `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/finadvisor

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_recommended
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Service
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Direct OpenAI (if using instead of OpenRouter)
# OPENAI_API_KEY=your_direct_openai_key_here
```

### 🗄️ Database Setup

#### Option A: MongoDB Atlas (Recommended for 2026+)

1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project and cluster
4. Click "Connect" and select "Connect your application"
5. Copy the connection string
6. Replace in `.env`:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/finadvisor
   ```

#### Option B: Local MongoDB

1. [Install MongoDB Community Server](https://docs.mongodb.com/manual/installation/)
2. Start MongoDB service:
   - **Windows**: `mongod`
   - **macOS**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`
3. Use connection string:
   ```
   MONGO_URI=mongodb://localhost:27017/finadvisor
   ```

### 🔑 API Keys Setup

#### OpenRouter API (AI Queries)

1. Go to [OpenRouter Console](https://openrouter.ai/dashboard/api-keys)
2. Create a new API key
3. Add to `.env`: `OPENROUTER_API_KEY=your_key_here`

#### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:5000/api/auth/google/callback`
   - `http://localhost:5173/dashboard`
6. Copy Client ID and Secret to `.env`

### ▶️ Running the Application

#### Terminal 1: Start Backend

```bash
cd backend
npm run dev  # Development with hot-reload
```

Output should show:
```
✅ MongoDB connected successfully!
🚀 Server successfully listening on http://localhost:5000
📚 API ready for requests
```

#### Terminal 2: Start Frontend

```bash
cd frontend
npm run dev
```

Output should show:
```
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.x.x:5173/
```

#### Access Application

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **API Docs**: Use REST client (Postman, Insomnia, Thunder Client)

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/auth/google` | Initiate Google OAuth login | ❌ |
| `GET` | `/api/auth/google/callback` | OAuth callback handler | ❌ |
| `GET` | `/api/auth/profile` | Get authenticated user profile | ✅ |
| `POST` | `/api/auth/logout` | Logout user & clear session | ✅ |

### Expense Management Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/expenses` | Get all user expenses | ✅ |
| `POST` | `/api/expenses` | Create new expense | ✅ |
| `PUT` | `/api/expenses/:id` | Update expense by ID | ✅ |
| `DELETE` | `/api/expenses/:id` | Delete expense by ID | ✅ |

### AI Query Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/ai/query` | Send financial query to AI | ✅ |
| `GET` | `/api/ai/history` | Get AI query history | ✅ |

### Example Requests

#### Login with Google
```bash
curl -X GET http://localhost:5000/api/auth/google
```

#### Add New Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Grocery shopping",
    "amount": 5000,
    "category": "Food",
    "date": "2026-01-02"
  }'
```

#### Ask AI Financial Question
```bash
curl -X POST http://localhost:5000/api/ai/query \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "How can I improve my savings rate?"
  }'
```

## 🏗️ Build for Production

### Frontend Build

```bash
cd frontend
npm run build          # Creates optimized build in dist/
npm run preview        # Preview production build locally
```

### Backend Production

```bash
cd backend
npm start              # Start production server
# Ensure MONGO_URI and other env vars are set in production
```

### Docker Deployment (Optional)

For containerized deployment, create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongo:27017/finadvisor
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongo
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
  
  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
```

## 🛠️ Development Guide

### Available Scripts

#### Backend Scripts

```bash
npm run dev       # Start development server with nodemon (hot-reload)
npm start         # Start production server
npm run lint      # Run ESLint (if configured)
npm test          # Run test suite (if tests exist)
```

#### Frontend Scripts

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build (optimized & minified)
npm run preview   # Preview production build
npm run lint      # Run ESLint
npm run format    # Format code with Prettier (if configured)
```

### Environment Variables Reference

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `PORT` | Express server port | No | `5000` |
| `NODE_ENV` | Environment mode | No | `development` |
| `MONGO_URI` | MongoDB connection string | ✅ Yes | `mongodb+srv://...` |
| `JWT_SECRET` | JWT signing key (min 32 chars) | ✅ Yes | `your_secret_key_here` |
| `OPENROUTER_API_KEY` | OpenRouter API key | ✅ Yes | `sk-or-v1-...` |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | ✅ Yes | `xxx.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | ✅ Yes | `GOCSPX-xxx` |
| `OPENAI_API_KEY` | Direct OpenAI key (optional) | No | `sk-...` |
| `GROQ_API_KEY` | Groq API key (optional) | No | `gsk-...` |

### Project Dependencies

#### Key Backend Dependencies
- `express` (5.2+) - Web framework
- `mongoose` (8.21+) - MongoDB ODM
- `jsonwebtoken` (9.0+) - JWT authentication
- `passport` (0.7+) - OAuth authentication
- `openai` (6.15+) - OpenRouter API client
- `bcryptjs` (3.0+) - Password hashing
- `cors` (2.8+) - CORS handling
- `dotenv` (17.2+) - Environment variables
- `nodemon` (3.1+) - Dev auto-restart

#### Key Frontend Dependencies
- `react` (18+) - UI library
- `react-router-dom` (6+) - Routing
- `vite` (4.5+) - Build tool
- `tailwindcss` (3+) - Utility CSS
- `axios` (1.6+) - HTTP client

## 🤝 Contributing

We welcome contributions! Here's how to contribute:

### Development Workflow

1. **Fork the repository**
   ```bash
   # Go to https://github.com/devansh-125/finadvisor/fork
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/finadvisor.git
   cd finadvisor
   ```

3. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **Make your changes**
   - Follow existing code style
   - Write clear commit messages
   - Update relevant documentation

5. **Commit & push**
   ```bash
   git add .
   git commit -m "feat: Add amazing feature"
   git push origin feature/amazing-feature
   ```

6. **Open Pull Request**
   - Describe changes clearly
   - Reference related issues
   - Request review from maintainers

### Contribution Guidelines

- ✅ Follow ESLint configuration
- ✅ Write meaningful commit messages (follow conventional commits)
- ✅ Test your changes thoroughly
- ✅ Update README if adding new features
- ✅ Ensure no breaking changes
- ✅ Add comments for complex logic
- ✅ Keep pull requests focused and concise

### Code Style

- **JavaScript**: Use ES6+ features
- **Naming**: camelCase for variables/functions, PascalCase for components/classes
- **Formatting**: 2-space indentation, use semicolons
- **Comments**: Add JSDoc for complex functions

## 📚 Documentation

- **[AI System Documentation](./AI_EXPLANATION.md)** - Detailed AI architecture and capabilities
- **[API Documentation](./API.md)** - Comprehensive API reference
- **Troubleshooting**: See [Issues](https://github.com/devansh-125/finadvisor/issues)

## 🐛 Troubleshooting

### Common Issues & Solutions

#### MongoDB Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:27017
Solution: Ensure MongoDB is running or check MONGO_URI in .env
```

#### Port Already in Use
```
Error: listen EADDRINUSE :::5000
Solution: Change PORT in .env or kill process: lsof -ti:5000 | xargs kill -9
```

#### API Key Errors
```
Error: OPENROUTER_API_KEY not found
Solution: Add OPENROUTER_API_KEY to .env and restart server
```

#### CORS Issues
```
Error: Access to XMLHttpRequest blocked by CORS
Solution: Ensure backend is running and frontend URL is whitelisted
```

## 📄 License

This project is licensed under the **ISC License** - see LICENSE file for details.

## 🤝 Support & Community

- **Issues**: [GitHub Issues](https://github.com/devansh-125/finadvisor/issues)
- **Discussions**: [GitHub Discussions](https://github.com/devansh-125/finadvisor/discussions)
- **Email**: Contact maintainers for support
- **Discord**: Join our community server (if available)

## 🌟 Project Status

- **Version**: 1.0.0 (Production Ready)
- **Last Updated**: January 2026
- **Status**: 🟢 Active Development
- **Maintainers**: [Devansh-125](https://github.com/devansh-125)

## 🚀 Future Roadmap

### Q1 2026
- [ ] Voice-enabled financial queries
- [ ] Multi-language support
- [ ] Mobile app (React Native)

### Q2 2026
- [ ] Investment portfolio tracking
- [ ] Bank API integrations
- [ ] Advanced predictive analytics

### Q3 2026+
- [ ] Real-time market data
- [ ] Blockchain integration
- [ ] AI-powered tax planning

## 🙏 Acknowledgments

- Built with ❤️ using Node.js, React, and MongoDB
- Powered by GPT-4 Turbo via OpenRouter
- Authentication by Passport.js and Google
- Styling with Tailwind CSS

---

**Made with passion for smarter financial management** 💰🤖✨

For the latest updates, visit [GitHub Repository](https://github.com/devansh-125/finadvisor)
