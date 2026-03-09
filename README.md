# Banking Backend API

A Node.js backend application for a banking system built with Express.js and MongoDB. It provides user authentication, account management, and transaction processing with email notifications.

## Features

- **User Authentication**: Register, login, and logout with JWT tokens and cookie-based sessions.
- **Account Management**: Create accounts, view user accounts, and check account balances.
- **Transaction Processing**: Transfer funds between accounts with idempotency support and ledger tracking.
- **Initial Funds**: Add initial funds to user accounts via a system endpoint.
- **Email Notifications**: Automated emails for registration and transactions using Resend.
- **Security**: Password hashing, JWT authentication, token blacklisting, and immutable ledger entries.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens), bcrypt for password hashing
- **Email Service**: Resend API
- **Other**: Cookie-parser, dotenv for environment variables

## Folder Structure

```
banking_backend/
├── .env                    # Environment variables
├── .gitignore              # Git ignore file
├── package.json            # Node.js dependencies and scripts
├── package-lock.json       # Lock file for dependencies
├── server.js               # Main server entry point
└── src/
    ├── app.js              # Express app configuration and routes
    ├── config/
    │   └── db.js           # MongoDB connection setup
    ├── controllers/
    │   ├── account.controllers.js    # Account-related logic (create, get, balance)
    │   ├── auth.controllers.js       # Authentication logic (register, login, logout)
    │   └── transaction.controllers.js # Transaction logic (transfers, initial funds)
    ├── middleware/
    │   └── auth.middleware.js        # JWT authentication middleware
    ├── models/
    │   ├── account.model.js          # Account schema (user, status, currency, systemAccount)
    │   ├── blackList.model.js        # Token blacklist schema
    │   ├── ledger.model.js           # Immutable ledger entries (debit/credit)
    │   ├── transaction.model.js      # Transaction schema (from/to accounts, amount, status)
    │   └── user.model.js             # User schema (email, name, password, systemUser)
    ├── routes/
    │   ├── account.routes.js         # Account routes (/api/accounts)
    │   ├── auth.routes.js            # Auth routes (/api/auth)
    │   └── transaction.routes.js     # Transaction routes (/api/transactions)
    └── services/
        └── email.service.js           # Email sending service using Resend
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
  - Body: `{ "email": "string", "name": "string", "password": "string" }`
  - Response: User data and JWT token
- `POST /api/auth/login` - Login user
  - Body: `{ "email": "string", "password": "string" }`
  - Response: User data and JWT token
- `POST /api/auth/logout` - Logout user (blacklists token)
  - Requires auth token
  - Response: Success message

### Accounts (`/api/accounts`)
- `POST /api/accounts` - Create a new account for the authenticated user
  - Requires auth
  - Response: New account details
- `GET /api/accounts` - Get all accounts for the authenticated user
  - Requires auth
  - Response: List of user accounts
- `GET /api/accounts/balance/:accountId` - Get balance for a specific account
  - Requires auth
  - Params: `accountId` (MongoDB ObjectId)
  - Response: Account balance

### Transactions (`/api/transactions`)
- `POST /api/transactions` - Create a transaction (transfer funds)
  - Requires auth
  - Body: `{ "fromAccount": "ObjectId", "toAccount": "ObjectId", "amount": number, "idempotencyKey": "string" }`
  - Response: Transaction details
- `POST /api/transactions/system/initial-funds` - Add initial funds to a user account (system use)
  - Requires system user auth
  - Body: `{ "toAccount": "ObjectId", "amount": number, "idempotencyKey": "string" }`
  - Response: Transaction details

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd banking_backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables in `.env` file (see Environment Variables section).

4. Start the server:
   ```bash
   npm run dev  # For development with nodemon
   # or
   npm start    # For production
   ```

The server will run on `http://localhost:3000` (or the port specified in `.env`).

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
MONGODB_URI=mongodb_uri                           # MongoDB connection string
JWT_SECRET=your_jwt_secret_key                   # Secret key for JWT signing
RESEND_API_KEY=your_resend_api_key               # API key for Resend email service
PORT=3000                                        # Server port (optional, defaults to 3000)
NODE_ENV=development                             # Environment (affects cookie security)
```

## Usage

1. **Register/Login**: Use `/api/auth/register` or `/api/auth/login` to authenticate and receive a JWT token.
2. **Create Account**: After login, use `/api/accounts` to create an account.
3. **Check Balance**: Use `/api/accounts/balance/:accountId` to view account balance.
4. **Transfer Funds**: Use `/api/transactions` to transfer money between accounts.
5. **Add Initial Funds**: Use `/api/transactions/system/initial-funds` (requires system user privileges) to add funds to an account.

All protected routes require a valid JWT token in cookies or Authorization header.

## Database Schema

- **Users**: Store user information with hashed passwords and system user flags.
- **Accounts**: Linked to users, with status (ACTIVE/FROZEN/CLOSED) and currency.
- **Transactions**: Record transfers with status (PENDING/COMPLETED/FAILED/REVERSED) and idempotency keys.
- **Ledger**: Immutable debit/credit entries for each transaction to track balances.
- **TokenBlacklist**: Stores invalidated JWT tokens.

Balances are calculated dynamically from ledger entries using MongoDB aggregation.

## Security Features

- Password hashing with bcrypt
- JWT-based authentication with token blacklisting
- Immutable ledger entries to prevent tampering
- Idempotency keys for transaction safety
- Cookie-based secure token storage
