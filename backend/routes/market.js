const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

// GET /api/market/search?query=symbol - Search for symbols
router.get('/search', marketController.searchSymbols);

// GET /api/market/quote/:symbol - Get quote for specific symbol
router.get('/quote/:symbol', marketController.getQuote);

// GET /api/market/historical/:symbol - Get historical data for symbol
router.get('/historical/:symbol', marketController.getHistoricalData);

// GET /api/market/trending - Get trending/popular stocks
router.get('/trending', marketController.getTrendingStocks);

// GET /api/market/us-stock-quotes - Get US stock quotes for homepage
router.get('/us-stock-quotes', marketController.getUsStockQuotes);
// GET /api/market/cn-stock-quotes - Get CN (A股) stock quotes for homepage
router.get('/cn-stock-quotes', marketController.getCnStockQuotes);

// Recommendations endpoints
// GET /api/market/recommendations - Get all active recommendations
router.get('/recommendations', marketController.getRecommendations);

// GET /api/market/recommendations/:symbol - Get recommendation for specific symbol
router.get('/recommendations/:symbol', marketController.getRecommendationBySymbol);

// US stocks batch quotes
router.post('/quotes/us', marketController.getUsMultipleQuotes)
// CN stocks batch quotes
router.post('/quotes/cn', marketController.getCnMultipleQuotes)

module.exports = router;