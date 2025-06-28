# Financial Analytics Dashboard

A full-stack financial analytics dashboard built with React, TypeScript, and Node.js.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16
- MongoDB
- Git

### Frontend Setup (Client)

1. **Navigate to client directory:**

   ```sh
   cd client
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Start development server:**
   ```sh
   npm run dev
   ```
   Frontend will be available at `http://localhost:5173`

### Backend Setup (Server)

1. **Navigate to server directory:**

   ```sh
   cd server
   ```

2. **Install dependencies:**

   ```sh
   npm install
   ```

3. **Set up environment variables:**
   Create `.env` file in `server/` with:

   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   CORS_ORIGIN=http://localhost:5173
   ```

4. **Start development server:**

   ```sh
   npm run dev
   ```

   Backend API will be available at `http://localhost:5000`

5. **Seed sample data (optional):**
   ```sh
   npm run seed
   ```

## 🔒 Security Features

- JWT Authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- HTTP Security Headers (Helmet)
- Cookie-based token storage
- Error handling middleware
- Request logging

## 📚 API Documentation

### Authentication Endpoints

#### 1. Register User

- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPass123!"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "_id": "user_id",
      "email": "user@example.com"
    }
  }
  ```

#### 2. Login User

- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPass123!"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "_id": "user_id",
      "email": "user@example.com"
    }
  }
  ```
- **Note:** JWT token is set in HTTP-only cookie

#### 3. Logout User

- **POST** `/api/auth/logout`
- **Response:** Clears authentication cookie

#### 4. Get Current User

- **GET** `/api/auth/me`
- **Headers:** Requires authentication
- **Response:** Current user data

### Transaction Endpoints

#### 1. Get All Transactions

- **GET** `/api/transactions`
- **Headers:** Requires authentication
- **Query Parameters:**
  - `page` (default: 1)
  - `limit` (default: 10)
  - `sortBy` (default: "date")
  - `sortOrder` ("asc" or "desc")
  - `category` ("Revenue" or "Expense")
  - `status` ("Paid" or "Pending")
  - `dateFrom` (ISO date)
  - `dateTo` (ISO date)
  - `search` (text search)

#### 2. Create Transaction

- **POST** `/api/transactions`
- **Headers:** Requires authentication
- **Body:**
  ```json
  {
    "date": "2025-06-28T00:00:00.000Z",
    "amount": 1000,
    "category": "Revenue",
    "status": "Paid",
    "user_id": "user_id",
    "user_profile": "profile_url"
  }
  ```

#### 3. Export Transactions (CSV)

- **POST** `/api/transactions/export-csv`
- **Headers:** Requires authentication
- **Body:**
  ```json
  {
    "columns": ["date", "amount", "category", "status", "user_id"]
  }
  ```
- **Response:** CSV file with headers
  ```csv
  Date,Amount,Category,Status,User ID
  2025-06-28,1000,Revenue,Paid,user_123
  ```

#### 4. Get Transaction Analytics

- **GET** `/api/transactions/summary`
- **GET** `/api/transactions/trends`
- **GET** `/api/transactions/category-breakdown`
- **Headers:** Requires authentication
- **Response:** Statistical data for dashboard

## 📊 Features

- Real-time financial analytics
- Interactive charts and graphs
- Transaction management
- CSV export functionality
- Responsive design
- Dark/Light mode toggle
- Error boundary protection
- Loading states and fallbacks

## 🛠️ Tech Stack

### Frontend

- React with TypeScript
- Material-UI (MUI)
- Recharts for visualizations
- Zustand for state management
- Axios for API calls
- React Router for navigation

### Backend

- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Express middleware
  - Rate limiting
  - CORS
  - Error handling
  - Authentication

## 📝 Development Notes

- Use `npm run build` in client directory for production build
- API requests are rate-limited to 100 requests per 15 minutes
- CSV exports handle large datasets efficiently
- MongoDB indexes are set up for optimal query performance
