# Portfolio Manager

A comprehensive financial portfolio management application built with Vue 3, Element Plus, Express.js, MySQL, and Yahoo Finance API integration.

## Features

### 🏠 Dashboard
- **Real-time Portfolio Overview**: Live portfolio value, daily changes, and performance metrics
- **Interactive Charts**: 5-day performance visualization with ECharts
- **Top Performers**: Display of best performing assets
- **AI Investment Suggestions**: Personalized recommendations based on portfolio composition
- **Market News & Activity**: Latest market updates and transaction history

### 💰 Holdings Management
- **CRUD Operations**: Add, edit, delete portfolio holdings
- **Real-time Price Updates**: Integration with Yahoo Finance API for current market prices
- **Comprehensive Asset Support**: Stocks, bonds, funds, crypto, and cash
- **Performance Tracking**: Gain/loss calculations and percentage returns
- **Data Validation**: Form validation for accurate data entry

### 📊 Performance Analytics
- **Detailed Performance Analysis**: Individual holding and overall portfolio performance
- **Historical Charts**: Interactive performance charts with multiple time periods
- **Progress Indicators**: Visual representation of gains and losses
- **Risk Metrics**: Performance attribution and risk assessment

### 🥧 Asset Allocation
- **Interactive Pie Charts**: Visual allocation by asset type and individual holdings
- **Diversification Analysis**: Portfolio concentration and risk assessment
- **Rebalancing Suggestions**: AI-powered recommendations for optimal allocation
- **Sector Exposure**: Breakdown by industry sectors

### 📈 Advanced Analytics
- **Risk Metrics**: Sharpe ratio, beta, volatility, and maximum drawdown
- **Value at Risk (VaR)**: Risk assessment for different time horizons
- **Correlation Analysis**: Holdings correlation matrix
- **Performance Attribution**: Detailed contribution analysis
- **Risk Management Recommendations**: Actionable insights for portfolio optimization

## Technology Stack

### Frontend
- **Vue 3**: Modern reactive JavaScript framework
- **Element Plus**: Comprehensive UI component library
- **Pinia**: State management
- **Vue Router**: Client-side routing
- **ECharts**: Interactive charts and visualizations
- **Axios**: HTTP client for API requests
- **Vite**: Fast build tool and development server

### Backend
- **Express.js**: Node.js web framework
- **MySQL**: Relational database
- **Yahoo Finance 2**: Real-time market data
- **Express Validator**: Input validation
- **CORS**: Cross-origin resource sharing
- **Helmet**: Security middleware
- **Rate Limiting**: API protection

## Project Structure

```
portfolio-manager/
├── backend/                  # Express.js backend
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── database/           # Database schema and migrations
│   ├── middleware/         # Custom middleware
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   └── server.js           # Main server file
├── frontend/               # Vue 3 frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── api/            # API service modules
│   │   ├── components/     # Vue components
│   │   ├── router/         # Routing configuration
│   │   ├── stores/         # Pinia stores
│   │   ├── views/          # Page components
│   │   ├── style.css       # Global styles
│   │   └── main.js         # Application entry point
│   ├── index.html          # HTML template
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── package.json            # Root package.json
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd portfolio-manager
```

### 2. Install Dependencies
```bash
# Install all dependencies (root, backend, frontend)
npm run install-all

# Or install individually
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 3. Database Setup
1. Create a MySQL database named `portfolio_db`
2. Update database credentials in `backend/.env`
3. Run the database schema:
```bash
mysql -u your_username -p portfolio_db < backend/database/schema.sql
```

### 4. Environment Configuration
Create `backend/.env` file:
```env
PORT=3000
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=portfolio_db
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

### 5. Start the Application
```bash
# Start both backend and frontend (recommended)
npm run dev

# Or start individually
npm run server    # Backend only
npm run client    # Frontend only
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## API Documentation

### Holdings Endpoints
- `GET /api/holdings` - Get all holdings
- `GET /api/holdings/:id` - Get specific holding
- `POST /api/holdings` - Create new holding
- `PUT /api/holdings/:id` - Update holding
- `DELETE /api/holdings/:id` - Delete holding
- `GET /api/holdings/summary` - Get portfolio summary
- `GET /api/holdings/historical` - Get historical data
- `POST /api/holdings/update-prices` - Update current prices

### Market Data Endpoints
- `GET /api/market/search?query=symbol` - Search for symbols
- `GET /api/market/quote/:symbol` - Get quote for symbol
- `POST /api/market/quotes` - Get multiple quotes
- `GET /api/market/historical/:symbol` - Get historical data
- `GET /api/market/trending` - Get trending stocks

## Features in Detail

### Real-time Data Integration
The application integrates with Yahoo Finance API to provide:
- Real-time stock prices
- Market data updates
- Symbol search functionality
- Historical price data
- Company information

### Data Validation
Comprehensive validation includes:
- Symbol format validation
- Price range validation
- Date validation (no future dates)
- Required field validation
- Data type validation

### Security Features
- CORS protection
- Rate limiting
- Input sanitization
- SQL injection prevention
- Helmet security headers

### Responsive Design
- Mobile-first approach
- Adaptive layouts for different screen sizes
- Touch-friendly interface
- Optimized performance on all devices

## Development

### Adding New Features
1. Backend: Add routes in `backend/routes/`, controllers in `backend/controllers/`
2. Frontend: Add views in `frontend/src/views/`, components in `frontend/src/components/`
3. Update API services in `frontend/src/api/`
4. Add state management in `frontend/src/stores/`

### Database Schema
The database includes tables for:
- `holdings`: Portfolio assets
- `portfolio_summary`: Aggregated portfolio data
- `market_data`: Cached market information
- `portfolio_history`: Historical performance data

### Testing
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
Update production environment variables:
- Set `NODE_ENV=production`
- Use production database credentials
- Configure proper CORS origins
- Set secure JWT secret

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact the development team or create an issue in the repository.

---

Built with ❤️ using Vue 3, Express.js, and modern web technologies.
