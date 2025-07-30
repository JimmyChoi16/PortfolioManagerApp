# Portfolio Manager - Architecture Diagram

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PORTFOLIO MANAGER                              │
│                              SYSTEM ARCHITECTURE                            │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   FRONTEND      │    │    BACKEND      │    │   EXTERNAL      │
│   (Vue.js 3)    │◄──►│   (Node.js)     │◄──►│   APIs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │   MySQL DB      │    │ Yahoo Finance   │
│   (LocalStorage)│    │   (Portfolio)   │    │   API           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔄 Data Flow Architecture

### 1. User Authentication Flow
```
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  User   │───►│ Login Page  │───►│ Auth Check  │───►│ Dashboard   │
└─────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                       │                     │
                       ▼                     ▼
              ┌─────────────┐    ┌─────────────┐
              │LocalStorage │◄───│Backend Valid│
              └─────────────┘    └─────────────┘
```

### 2. Portfolio Management Flow
```
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  User   │───►│Frontend Comp│───►│ API Request │───►│Backend Ctrl │
└─────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              │
                                                              ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│UI Update    │◄───│Frontend State│◄───│Response     │◄───│Database     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                              ▲
                                                              │
                                              ┌─────────────┐ │
                                              │Yahoo Finance│ │
                                              │API          │ │
                                              └─────────────┘ │
                                                              │
                                              ┌─────────────┐ │
                                              │Service Layer│ │
                                              └─────────────┘ │
```

### 3. Real-time Data Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Yahoo Finance│───►│Backend Serv │───►│Database Cache│───►│Frontend Disp│
│API          │    │             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
         ▲                     ▲                     ▲
         │                     │                     │
         └─────────────────────┼─────────────────────┘
                               │
                    ┌─────────────┐
                    │Scheduled    │
                    │Tasks        │
                    └─────────────┘
```

## 🔧 Component Architecture

### Frontend Component Hierarchy
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

App.vue (Root Component)
├── Navigation & Routing
├── Authentication State Management
└── Page Components
    ├── Dashboard.vue
    │   ├── Portfolio Summary Cards
    │   ├── Holdings Table
    │   ├── Quick Actions
    │   └── Analysis Dialogs
    ├── StockSection.vue
    │   ├── Stock Portfolio Overview
    │   ├── Real-time Market Data
    │   └── Sector Allocation
    ├── BondSection.vue
    │   ├── Bond Portfolio Overview
    │   ├── Yield Curve Analysis
    │   └── Bond Ladder Strategy
    ├── FundSection.vue
    │   ├── Fund Portfolio Overview
    │   ├── Fund Performance
    │   └── Fund Categories
    ├── CashSection.vue
    │   ├── Cash Management Overview
    │   ├── Cash Flow Analysis
    │   └── Emergency Fund Calculator
    └── LoginPage.vue
        ├── Login Form
        └── Authentication Logic
```

### Backend Service Architecture
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BACKEND ARCHITECTURE                           │
└─────────────────────────────────────────────────────────────────────────────┘

Server.js (Entry Point)
├── Express.js Setup
├── Middleware Stack
│   ├── Security (Helmet, CORS)
│   ├── Rate Limiting
│   ├── Body Parsing
│   └── Logging
├── Route Handlers
│   ├── /api/holdings
│   └── /api/market
└── Service Layer
    ├── HoldingController
    │   ├── CRUD Operations
    │   ├── Portfolio Analysis
    │   └── Performance Calculations
    ├── MarketController
    │   ├── Market Data Fetching
    │   ├── Symbol Search
    │   └── Recommendations
    ├── YahooFinanceService
    │   ├── Real-time Quotes
    │   ├── Historical Data
    │   └── Market Information
    └── Database Operations
        ├── MySQL Connection Pool
        ├── Query Execution
        └── Data Validation
```

## 📊 Database Architecture

### Database Schema
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

MySQL Database (Portfolio)
├── holdings
│   ├── id (Primary Key)
│   ├── symbol (Stock/Fund Symbol)
│   ├── name (Asset Name)
│   ├── type (stock/bond/fund/cash/crypto)
│   ├── quantity (Number of shares/units)
│   ├── purchase_price (Cost basis)
│   ├── current_price (Market price)
│   ├── purchase_date (Acquisition date)
│   ├── sector (Industry classification)
│   └── notes (Additional information)
├── portfolio_summary
│   ├── total_value (Portfolio value)
│   ├── total_holdings (Number of positions)
│   ├── total_gain (Unrealized gains/losses)
│   └── avg_gain_percent (Average return)
├── market_data
│   ├── symbol (Asset symbol)
│   ├── price (Current market price)
│   ├── change (Price change)
│   ├── change_percent (Percentage change)
│   └── last_updated (Timestamp)
├── portfolio_history
│   ├── date (Historical date)
│   ├── total_value (Portfolio value on date)
│   ├── total_gain (Gains/losses on date)
│   └── avg_gain_percent (Return on date)
└── simple_recommendations
    ├── symbol (Recommended asset)
    ├── name (Asset name)
    ├── reason (Recommendation reason)
    ├── confidence (Confidence score)
    ├── expected_return (Expected return)
    ├── risk (Risk level)
    └── category (Asset category)
```

## 🔄 State Management Architecture

### Pinia Store Structure
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              STATE MANAGEMENT                               │
└─────────────────────────────────────────────────────────────────────────────┘

Portfolio Store (Pinia)
├── State
│   ├── holdings (Array of portfolio positions)
│   ├── portfolioSummary (Portfolio overview data)
│   ├── marketData (Real-time market information)
│   ├── analysisData (Analytics and insights)
│   └── uiState
│       ├── loading (Loading states)
│       ├── errors (Error states)
│       └── userPreferences (User settings)
├── Actions
│   ├── fetchHoldings (Get portfolio data)
│   ├── createHolding (Add new position)
│   ├── updateHolding (Modify existing position)
│   ├── deleteHolding (Remove position)
│   ├── updatePrices (Refresh market data)
│   └── refreshAll (Complete data refresh)
└── Getters
    ├── totalValue (Portfolio total)
    ├── totalGain (Unrealized gains/losses)
    ├── allocationByType (Asset type breakdown)
    └── allocationBySector (Sector breakdown)
```

## 📡 API Architecture

### RESTful API Endpoints
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

/api/holdings
├── GET /api/holdings
│   └── Retrieve all portfolio holdings
├── GET /api/holdings/:id
│   └── Get specific holding details
├── POST /api/holdings
│   └── Create new holding
├── PUT /api/holdings/:id
│   └── Update existing holding
├── DELETE /api/holdings/:id
│   └── Delete holding
├── GET /api/holdings/summary
│   └── Portfolio summary data
├── GET /api/holdings/analysis/allocation
│   └── Asset allocation analysis
├── GET /api/holdings/analysis/performance
│   └── Performance metrics
├── GET /api/holdings/analysis/sector
│   └── Sector breakdown
├── GET /api/holdings/analysis/history
│   └── Historical performance data
└── POST /api/holdings/update-prices
    └── Update current market prices

/api/market
├── GET /api/market/search
│   └── Search for symbols
├── GET /api/market/quote/:symbol
│   └── Get quote for specific symbol
├── POST /api/market/quotes
│   └── Get multiple quotes
└── GET /api/market/recommendations
    └── Investment recommendations
```

## 🔐 Security Architecture

### Authentication & Authorization Flow
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SECURITY ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

User Authentication Flow
├── Login Request
│   ├── Credential Validation
│   ├── Session Creation
│   └── Token Generation
├── Session Management
│   ├── Token Storage (LocalStorage)
│   ├── Session Validation
│   └── Auto-refresh Tokens
├── Route Protection
│   ├── Authentication Guards
│   ├── Role-based Access
│   └── Route Permissions
└── Security Middleware
    ├── CORS Configuration
    ├── Rate Limiting
    ├── Input Validation
    └── SQL Injection Prevention
```

## 🚀 Deployment Architecture

### Development to Production Pipeline
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DEPLOYMENT ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────┘

Development Pipeline
├── Code Repository (Git)
│   ├── Feature Branches
│   ├── Code Review
│   └── Merge to Main
├── Build Process
│   ├── Frontend Build (Vite)
│   │   ├── Code Compilation
│   │   ├── Asset Optimization
│   │   └── Bundle Generation
│   └── Backend Build (Node.js)
│       ├── Dependency Installation
│       ├── Environment Configuration
│       └── Service Startup
├── Testing
│   ├── Unit Tests
│   ├── Integration Tests
│   └── End-to-End Tests
└── Deployment
    ├── Database Migration
    ├── Service Deployment
    ├── Health Checks
    └── Monitoring Setup
```

## 📈 Performance Architecture

### Optimization Strategies
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PERFORMANCE ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────────┘

Frontend Optimization
├── Code Splitting
│   ├── Route-based Lazy Loading
│   ├── Component Lazy Loading
│   └── Dynamic Imports
├── Caching Strategy
│   ├── Browser Cache
│   ├── Service Worker Cache
│   └── Memory Cache
└── Bundle Optimization
    ├── Tree Shaking
    ├── Minification
    └── Compression

Backend Optimization
├── Database Optimization
│   ├── Query Optimization
│   ├── Indexing Strategy
│   └── Connection Pooling
├── API Optimization
│   ├── Response Caching
│   ├── Request Batching
│   └── Pagination
└── External API Optimization
    ├── Rate Limiting
    ├── Data Caching
    └── Fallback Strategies
```

## 🔍 Monitoring Architecture

### System Observability
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              MONITORING ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────────────────┘

Application Monitoring
├── Logging
│   ├── Request Logging
│   ├── Error Logging
│   └── Performance Logging
├── Metrics
│   ├── Response Times
│   ├── Error Rates
│   └── Resource Usage
└── Alerting
    ├── Error Alerts
    ├── Performance Alerts
    └── Availability Alerts

User Analytics
├── User Behavior Tracking
│   ├── Page Views
│   ├── User Actions
│   └── Feature Usage
├── Performance Analytics
│   ├── Load Times
│   ├── User Experience
│   └── Conversion Rates
└── Business Metrics
    ├── Active Users
    ├── Portfolio Growth
    └── Feature Adoption
```

---

*This architecture diagram provides a comprehensive technical overview of the Portfolio Manager application's system design, component relationships, and data flow patterns.* 