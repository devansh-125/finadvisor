# FinAdvisor Backend

A Node.js backend for the FinAdvisor application, providing AI-powered financial advice and expense tracking.

## Features

- User authentication (register/login)
- Expense tracking and management
- AI-powered financial queries using OpenAI
- MongoDB database integration

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:

   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/finadvisor
   JWT_SECRET=your_jwt_secret_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. Start MongoDB (if using local instance)

4. Run the server:
   ```bash
   npm run dev  # Development mode with nodemon
   npm start    # Production mode
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)

### Expenses

- `GET /api/expenses` - Get all expenses (requires auth)
- `POST /api/expenses` - Add new expense (requires auth)
- `PUT /api/expenses/:id` - Update expense (requires auth)
- `DELETE /api/expenses/:id` - Delete expense (requires auth)

### AI

- `POST /api/ai/query` - Ask AI financial question (requires auth)

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- OpenAI API for AI features
- bcryptjs for password hashing
