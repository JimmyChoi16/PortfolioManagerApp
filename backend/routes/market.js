const express = require('express');
const router = express.Router();
const marketController = require('../controllers/marketController');

// GET /api/market/search?query=symbol - Search for symbols
router.get('/search', marketController.searchSymbols);

// GET /api/market/quote/:symbol - Get quote for specific symbol
router.get('/quote/:symbol', marketController.getQuote);

// POST /api/market/quotes - Get quotes for multiple symbols
router.post('/quotes', marketController.getMultipleQuotes);

// GET /api/market/historical/:symbol - Get historical data for symbol
router.get('/historical/:symbol', marketController.getHistoricalData);

// GET /api/market/trending - Get trending/popular stocks
router.get('/trending', marketController.getTrendingStocks);

module.exports = router;