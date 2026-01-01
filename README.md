# FinAdvisor

A full-stack JavaScript application that provides AI-powered financial advice while tracking daily expenses and offering personalized recommendations based on spending patterns.

## Features

- **Expense Tracking**: Log and categorize daily expenses
- **AI Financial Queries**: Ask questions and get AI-powered responses
- **Personalized Recommendations**: Receive tailored financial advice based on spending patterns
- **Financial Dashboard**: Visualize spending trends and insights
- **User Profiles**: Manage personal financial information
- **Secure Authentication**: JWT-based authentication with Google OAuth integration

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, JWT, OpenAI API
- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Database**: MongoDB (Atlas or Local)
- **Authentication**: JWT, bcryptjs, Google OAuth
- **AI Integration**: OpenAI API for financial advice

## Project Structure

```
finadvisor/
├── backend/          # Node.js/Express API server
│   ├── config/       # Configuration files
│   ├── middleware/   # Express middleware
│   ├── models/       # MongoDB models
│   ├── routes/       # API routes
│   ├── services/     # Business logic services
│   ├── index.js      # Server entry point
│   └── package.json
├── frontend/         # React/Vite client application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # React context providers
│   │   ├── pages/       # Page components
│   │   └── main.jsx     # App entry point
│   ├── index.html
│   └── package.json
└── README.md         # Project documentation
```

## Quick Start

### Prerequisites

- Node.js (v18+)
- MongoDB (Atlas or Local)
- Git

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/devansh-125/finadvisor.git
   cd finadvisor
   ```

2. **Backend Setup:**

   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup:**

   ```bash
   cd ../frontend
   npm install
   cd ..
   ```

4. **Environment Configuration:**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string_here
   JWT_SECRET=your_jwt_secret_here
   OPENAI_API_KEY=your_openai_api_key_here
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

### Database Setup

**Option A: MongoDB Atlas (Recommended)**

- Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
- Create a free account and cluster
- Get your connection string from "Connect" > "Connect your application"
- Example: `mongodb+srv://username:password@cluster.mongodb.net/finadvisor`

**Option B: Local MongoDB**

- Install MongoDB Community Server
- Start MongoDB service
- Use: `mongodb://localhost:27017/finadvisor`

### Running the Application

1. **Start Backend:**

   ```bash
   cd backend
   npm run dev  # Development mode with nodemon
   # or
   npm start    # Production mode
   ```

2. **Start Frontend (in new terminal):**

   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application:**
   - Frontend: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

## API Endpoints

### Authentication

- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/google/callback` - OAuth callback
- `GET /api/auth/profile` - Get user profile (requires auth)
- `POST /api/auth/logout` - Logout user

### Expenses

- `GET /api/expenses` - Get all expenses (requires auth)
- `POST /api/expenses` - Add new expense (requires auth)
- `PUT /api/expenses/:id` - Update expense (requires auth)
- `DELETE /api/expenses/:id` - Delete expense (requires auth)

### AI Queries

- `POST /api/ai/query` - Ask AI financial question (requires auth)
- `GET /api/ai/history` - Get AI query history (requires auth)

## Build for Production

### Frontend Build

```bash
cd frontend
npm run build
```

### Backend Build

```bash
cd backend
npm run build  # If build script exists
```

## Development

### Available Scripts

**Backend:**

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests

**Frontend:**

- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

| Variable               | Description                 | Required |
| ---------------------- | --------------------------- | -------- |
| `PORT`                 | Server port (default: 5000) | No       |
| `MONGO_URI`            | MongoDB connection string   | Yes      |
| `JWT_SECRET`           | JWT signing secret          | Yes      |
| `OPENAI_API_KEY`       | OpenAI API key              | Yes      |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID      | Yes      |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret  | Yes      |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

## License

ISC

## Support

For questions or issues, please open an issue on GitHub or contact the maintainers.
