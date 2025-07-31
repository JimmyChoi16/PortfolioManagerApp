# WealthU (沃富)

A comprehensive portfolio management application that allows users to track, analyze, and manage their investment portfolios with real-time market data and advanced analytics.

## Features

### 🔐 Authentication
- Simple login/signup system
- Secure session management
- User-specific portfolio data

### 📊 Portfolio Management
- **CRUD Operations**: Add, edit, delete, and view holdings
- **Multiple Asset Types**: Stocks, bonds, funds, cash, and cryptocurrencies
- **Real-time Data**: Live market prices and updates
- **Performance Tracking**: Gain/loss calculations and historical data

### 📈 Advanced Analytics
- **Asset Allocation Analysis**: Breakdown by type and sector
- **Performance Analysis**: Total returns, cost basis, and percentage gains
- **Sector Analysis**: Industry-specific portfolio breakdown
- **Historical Performance**: Detailed performance tracking over time

### 🎯 Investment Insights
- **Investment Recommendations**: Buy/sell/hold suggestions
- **Portfolio Summary**: Overview cards with key metrics
- **Search & Filter**: Easy navigation through holdings
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database
- **Yahoo Finance API** for market data
- **RESTful API** architecture

### Frontend
- **Vue.js 3** with Composition API
- **Element Plus** UI components
- **Axios** for HTTP requests
- **Responsive CSS** with modern design

## Database Schema

### Core Tables
1. **holdings** - Individual investment positions
2. **portfolio_summary** - Aggregated portfolio data
3. **market_data** - Cached market information
4. **portfolio_history** - Historical performance data
5. **simple_recommendations** - Investment advice

### Key Features
- Soft delete functionality
- Real-time price updates
- Sector and type categorization
- Performance calculations
- Historical tracking

## API Endpoints

### Holdings Management
```
GET    /api/holdings              - Get all holdings
GET    /api/holdings/:id          - Get specific holding
POST   /api/holdings              - Create new holding
PUT    /api/holdings/:id          - Update holding
DELETE /api/holdings/:id          - Delete holding
```

### Portfolio Analysis
```
GET    /api/holdings/summary              - Portfolio summary
GET    /api/holdings/analysis/allocation  - Asset allocation
GET    /api/holdings/analysis/performance - Performance metrics
GET    /api/holdings/analysis/sector      - Sector breakdown
GET    /api/holdings/analysis/history     - Historical data
```

### Market Data
```
GET    /api/market/search         - Search symbols
GET    /api/market/quote/:symbol  - Get quote
POST   /api/market/quotes         - Multiple quotes
GET    /api/market/recommendations - Investment recommendations
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WealthU
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create database and tables
   mysql -u root -p < backend/database/schema.sql
   ```

4. **Environment Configuration**
   ```bash
   # Copy and configure environment variables
   cp backend/.env.example backend/.env
   # Edit backend/.env with your database credentials
   ```

5. **Start the Application**
   ```bash
   # Start backend server (from backend directory)
   npm start
   
   # Start frontend development server (from frontend directory)
   npm run dev
   ```

### Usage

1. **Access the Application**
   - Open your browser and navigate to `http://localhost:5173`
   - You'll see the landing page with feature overview

2. **Login/Register**
   - Click "Login" to access your portfolio
   - For demo purposes, any email/password combination will work
   - You'll be redirected to the dashboard after successful login

3. **Manage Your Portfolio**
   - **Dashboard**: Overview of all holdings and performance
   - **Add Holdings**: Use the "Add Holding" button to create new positions
   - **Edit/Delete**: Use action buttons in the holdings table
   - **View Analysis**: Click "View Analysis" for detailed insights

4. **Asset Categories**
   - **Stocks**: Individual company shares
   - **Bonds**: Fixed-income securities
   - **Funds**: Mutual funds and ETFs
   - **Cash**: Cash equivalents and money market

## Features in Detail

### Dashboard
- **Portfolio Summary Cards**: Total value, holdings count, average return
- **Quick Actions**: Add holdings, update prices, view analysis
- **Holdings Table**: Complete list with search and filtering
- **Real-time Updates**: Automatic price updates every 30 seconds

### Analysis Tools
- **Asset Allocation**: Visual breakdown by investment type
- **Performance Metrics**: Total gains, cost basis, percentage returns
- **Sector Analysis**: Industry-specific portfolio composition
- **Historical Data**: Performance tracking over time

### Investment Recommendations
- **Buy/Sell/Hold**: Simple investment advice
- **Expiration Dates**: Time-sensitive recommendations
- **Reasoning**: Clear explanations for each recommendation

## Development

### Project Structure
```
PortfolioManagerApp/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # API route handlers
│   ├── database/        # SQL schema and migrations
│   ├── middleware/      # Validation and auth
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   └── services/        # External API services
├── frontend/
│   ├── src/
│   │   ├── api/         # API client functions
│   │   ├── components/  # Vue components
│   │   ├── router/      # Vue router configuration
│   │   └── stores/      # State management
│   └── public/          # Static assets
└── README.md
```

### Adding New Features
1. **Backend**: Add new routes, controllers, and models
2. **Frontend**: Create new components and API calls
3. **Database**: Update schema if needed
4. **Testing**: Test all CRUD operations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository.
