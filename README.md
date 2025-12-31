# FramezLabs ERP

A comprehensive, full-stack ERP system for FramezLabs facilitating Inventory, Order Management, CRM, and HR operations. Built with React, Node.js, Express, and MongoDB.

## Features

- **Point of Sale (POS)**: Complete checkout system with invoice generation
- **Inventory Management**: Track products, stock levels, and suppliers
- **Sales History**: View and manage all transactions with invoice printing
- **Customer Management**: Track customer data and purchase history
- **Enquiries**: Manage website enquiries and customer requests
- **User Management**: Role-based access control (Admin, Manager, Staff)

## Tech Stack

**Frontend:**
- React + TypeScript
- Vite
- TailwindCSS
- Lucide Icons
- React Router

**Backend:**
- Node.js + Express
- NestJS
- MongoDB + Mongoose
- JWT Authentication
- Passport.js

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB instance
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/framezlabs-erp.git
   cd framezlabs-erp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**

   **Root Directory:**
   ```bash
   cp .env.sample .env
   ```
   Update `.env` with your MongoDB URI and JWT secret.

   **Server Directory:**
   ```bash
   cd server
   cp .env.sample .env
   ```
   Update with your actual credentials:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `PORT`: Server port (default: 5000)

   **Client Directory:**
   ```bash
   cd client
   cp .env.sample .env
   ```
   Update with your backend API URL:
   - `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api)

4. **Run the application**
   ```bash
   npm run dev
   ```
   This will start both the frontend (port 5173) and backend (port 5000) concurrently.

## Security Notes

⚠️ **IMPORTANT**: 
- Never commit `.env` files to version control
- The `.env` files are already in `.gitignore`
- Always use `.env.sample` as a template with dummy values
- Use strong, unique values for `JWT_SECRET` in production
- Rotate credentials immediately if exposed

## Project Structure

```
framezlabs-erp/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   └── context/     # React context providers
│   └── .env.sample      # Frontend environment template
├── server/              # NestJS backend
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── users/       # User management
│   │   ├── products/    # Product/inventory
│   │   ├── transactions/# POS transactions
│   │   ├── customers/   # Customer management
│   │   └── enquiries/   # Enquiry management
│   └── .env.sample      # Backend environment template
└── .env.sample          # Root environment template
```

## License

This project is licensed under the MIT License.
