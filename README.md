# FinAdvisor

A full-stack JavaScript application that provides AI-powered financial advice while tracking daily expenses and offering personalized recommendations based on spending patterns.

## Features

- **Expense Tracking**: Log and categorize daily expenses
- **AI Financial Queries**: Ask questions and get AI-powered responses
- **Personalized Recommendations**: Receive tailored financial advice based on spending patterns
- **Financial Dashboard**: Visualize spending trends and insights
- **User Profiles**: Manage personal financial information

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, JWT, OpenAI API
- **Frontend**: React, Vite, Tailwind CSS, React Router
- **Database**: MongoDB

## Project Structure

```
finadvisor/
├── backend/          # Node.js/Express API server
├── frontend/         # React/Vite client application
└── README.md         # Project documentation
```

## Setup

### Prerequisites

- Node.js (v18+)
- MongoDB
- Git

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/finadvisor
   JWT_SECRET=your_jwt_secret_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. Start MongoDB

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Expenses
- `GET /api/expenses` - Get expenses
- `POST /api/expenses` - Add expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### AI
- `POST /api/ai/query` - Ask AI question

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

ISC
