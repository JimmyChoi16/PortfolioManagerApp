#!/bin/bash

echo "🚀 Portfolio Manager Setup Script"
echo "================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v16 or higher."
    exit 1
fi

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL v8.0 or higher."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo "✅ Dependencies installed successfully"

# Setup environment file
echo "⚙️ Setting up environment configuration..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "📝 Created backend/.env file - please update with your MySQL credentials"
else
    echo "✅ backend/.env already exists"
fi

# Database setup instructions
echo ""
echo "🗄️ Database Setup Instructions:"
echo "1. Create a MySQL database named 'portfolio_db'"
echo "2. Update your MySQL credentials in backend/.env"
echo "3. Run the database schema:"
echo "   mysql -u your_username -p portfolio_db < backend/database/schema.sql"
echo ""

# Final instructions
echo "🎉 Setup completed!"
echo ""
echo "To start the application:"
echo "  npm run dev     # Start both frontend and backend"
echo "  npm run server  # Start backend only"
echo "  npm run client  # Start frontend only"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:3000"
echo ""
echo "📚 Check README.md for detailed documentation"