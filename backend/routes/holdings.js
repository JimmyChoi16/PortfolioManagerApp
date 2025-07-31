const express = require('express');
const router = express.Router();
const holdingController = require('../controllers/holdingController');
const validationRules = require('../middleware/validation');

// GET /api/holdings - Get all holdings
router.get('/', holdingController.getAllHoldings);

// GET /api/holdings/summary - Get portfolio summary
router.get('/summary', holdingController.getPortfolioSummary);

// GET /api/holdings/historical - Get historical performance data
router.get('/historical', holdingController.getHistoricalData);

// POST /api/holdings/update-prices - Update current prices for all holdings
router.post('/update-prices', holdingController.updateCurrentPrices);

// POST /api/holdings/update-fund-prices - Update fund prices with real-time data
router.post('/update-fund-prices', holdingController.updateFundPrices);

// Analysis endpoints
// GET /api/holdings/analysis/allocation - Get asset allocation analysis
router.get('/analysis/allocation', holdingController.getAllocationAnalysis);

// GET /api/holdings/analysis/performance - Get performance analysis
router.get('/analysis/performance', holdingController.getPerformanceAnalysis);

// GET /api/holdings/analysis/sector - Get sector analysis
router.get('/analysis/sector', holdingController.getSectorAnalysis);

// GET /api/holdings/analysis/history - Get detailed historical analysis
router.get('/analysis/history', holdingController.getDetailedHistoryAnalysis);

// Fund-specific endpoints
// GET /api/holdings/funds - Get all funds
router.get('/funds', holdingController.getFunds);

// GET /api/holdings/funds/categories - Get fund categories
router.get('/funds/categories', holdingController.getFundCategories);

// GET /api/holdings/funds/performance - Get fund performance
router.get('/funds/performance', holdingController.getFundPerformance);

// POST /api/holdings/funds - Add fund holdings
router.post('/funds', validationRules.createHolding, holdingController.addFundHoldings);

// GET /api/holdings/funds/search - Search funds
router.get('/funds/search', holdingController.searchFunds);

// GET /api/holdings/funds/:symbol/volatility - Get fund volatility
router.get('/funds/:symbol/volatility', holdingController.getFundVolatility);

// GET /api/holdings/funds/:symbol/returns - Get fund returns for different periods
router.get('/funds/:symbol/returns', holdingController.getFundReturns);

// GET /api/holdings/funds/:symbol/performance-history - Get fund performance history for chart
router.get('/funds/:symbol/performance-history', holdingController.getFundPerformanceHistory);

// POST /api/holdings/trade - Execute trade
router.post('/trade', holdingController.executeTrade);

// GET /api/holdings/analysis/realtime-metrics - Get real-time performance metrics
router.get('/analysis/realtime-metrics', holdingController.getRealTimePerformanceMetrics);

// POST /api/holdings/update-history - Update portfolio history
router.post('/update-history', holdingController.updatePortfolioHistory);

// GET /api/holdings/:id - Get holding by ID
router.get('/:id', holdingController.getHoldingById);

// POST /api/holdings - Create new holding
router.post('/', validationRules.createHolding, holdingController.createHolding);

// PUT /api/holdings/:id - Update holding
router.put('/:id', validationRules.updateHolding, holdingController.updateHolding);

// DELETE /api/holdings/:id - Delete holding
router.delete('/:id', holdingController.deleteHolding);

module.exports = router;