# Portfolio Manager API Documentation

## Base URL
```
http://localhost:3000/api
```

## Holdings Endpoints

### Get All Holdings
```
GET /holdings
```
Returns all active holdings with calculated values.

### Get Portfolio Summary
```
GET /holdings/summary
```
Returns portfolio summary including total value, gains, and top performers.

### Get Historical Data
```
GET /holdings/historical
```
Returns historical performance data for charts.

### Update Current Prices
```
POST /holdings/update-prices
```
Updates current prices for all holdings using real-time market data.

### Create New Holding
```
POST /holdings
```
Creates a new holding with the following fields:
- `symbol` (required): Stock symbol (1-10 characters)
- `name` (required): Company name (1-255 characters)
- `type` (required): Asset type (stock, bond, cash, fund, crypto)
- `quantity` (required): Number of shares/units (positive number)
- `purchase_price` (required): Purchase price per unit (positive number)
- `purchase_date` (required): Purchase date (YYYY-MM-DD format)
- `sector` (optional): Industry sector (max 50 characters)
- `notes` (optional): Additional notes (max 1000 characters)

### Update Holding
```
PUT /holdings/:id
```
Updates an existing holding with the same fields as create.

### Delete Holding
```
DELETE /holdings/:id
```
Soft deletes a holding (sets is_active to false).

## Analysis Endpoints

### Asset Allocation Analysis
```
GET /holdings/analysis/allocation
```
Returns asset allocation breakdown by type (stock, bond, cash, fund, crypto).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "stock",
      "count": 4,
      "total_value": "107125.00",
      "percentage": "100.00"
    }
  ]
}
```

### Performance Analysis
```
GET /holdings/analysis/performance
```
Returns overall portfolio performance metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "current_value": "107125.00",
    "total_cost": "95000.00",
    "total_gain_loss": "12125.00",
    "gain_loss_percent": "12.76"
  }
}
```

### Sector Analysis
```
GET /holdings/analysis/sector
```
Returns portfolio breakdown by industry sector.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "sector": "Technology",
      "count": 3,
      "total_value": "81500.00",
      "percentage": "76.07"
    },
    {
      "sector": "Automotive",
      "count": 1,
      "total_value": "6250.00",
      "percentage": "23.93"
    }
  ]
}
```

### Detailed History Analysis
```
GET /holdings/analysis/history
```
Returns detailed historical performance data with cost basis and gains.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "2024-01-19",
      "total_value": "107125.00",
      "daily_change": "3325.00",
      "total_cost": "95000.00",
      "total_gain_loss": "12125.00",
      "gain_loss_percent": "12.76",
      "daily_change_percent": "3.20"
    }
  ]
}
```

## Market Data Endpoints

### Search Symbols
```
GET /market/search?query=AAPL
```
Searches for stock symbols.

### Get Quote
```
GET /market/quote/AAPL
```
Gets real-time quote for a specific symbol.

### Get Multiple Quotes
```
POST /market/quotes
Body: { "symbols": ["AAPL", "MSFT", "GOOGL"] }
```
Gets quotes for multiple symbols.

### Get Historical Data
```
GET /market/historical/AAPL?period=1mo&interval=1d
```
Gets historical price data for a symbol.

### Get Trending Stocks
```
GET /market/trending
```
Returns popular stocks sorted by performance.

### Get Public Quotes
```
GET /market/public-quotes
```
Returns public market data for homepage.

## Recommendations Endpoints

### Get All Recommendations
```
GET /market/recommendations
```
Returns all active investment recommendations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "symbol": "AAPL",
      "recommendation": "hold",
      "reason": "Strong fundamentals, wait for better entry point",
      "created_at": "2024-01-19T10:00:00.000Z",
      "expires_at": "2024-02-18T10:00:00.000Z"
    }
  ]
}
```

### Get Recommendation by Symbol
```
GET /market/recommendations/AAPL
```
Returns the most recent active recommendation for a specific symbol.

## Database Schema Changes

### Holdings Table
Added new fields:
- `sector` (VARCHAR(50)): Industry sector
- `notes` (TEXT): Additional notes
- `is_active` (BOOLEAN): Soft delete flag

### Market Data Table
Added new fields:
- `sector` (VARCHAR(50)): Industry sector
- `dividend_yield` (DECIMAL(5,3)): Dividend yield percentage
- `pe_ratio` (DECIMAL(10,3)): Price-to-earnings ratio

### Portfolio History Table
Added new fields:
- `total_cost` (DECIMAL(20,2)): Total cost basis
- `total_gain_loss` (DECIMAL(20,2)): Total unrealized gains/losses
- `gain_loss_percent` (DECIMAL(5,2)): Percentage gain/loss

### Simple Recommendations Table
New table for basic investment advice:
- `id` (INT): Primary key
- `symbol` (VARCHAR(10)): Stock symbol
- `recommendation` (ENUM): buy, sell, hold
- `reason` (VARCHAR(255)): Recommendation reason
- `created_at` (TIMESTAMP): Creation time
- `expires_at` (TIMESTAMP): Expiration time

## Error Responses

All endpoints return errors in the following format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Validation Errors

Validation errors include field-specific messages:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "symbol",
      "message": "Symbol is required"
    }
  ]
}
``` 