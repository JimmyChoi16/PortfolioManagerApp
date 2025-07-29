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

// Analysis endpoints
// GET /api/holdings/analysis/allocation - Get asset allocation analysis
router.get('/analysis/allocation', holdingController.getAllocationAnalysis);

// GET /api/holdings/analysis/performance - Get performance analysis
router.get('/analysis/performance', holdingController.getPerformanceAnalysis);

// GET /api/holdings/analysis/sector - Get sector analysis
router.get('/analysis/sector', holdingController.getSectorAnalysis);

// GET /api/holdings/analysis/history - Get detailed historical analysis
router.get('/analysis/history', holdingController.getDetailedHistoryAnalysis);

// GET /api/holdings/:id - Get holding by ID
router.get('/:id', holdingController.getHoldingById);

// POST /api/holdings - Create new holding
router.post('/', validationRules.createHolding, holdingController.createHolding);

// PUT /api/holdings/:id - Update holding
router.put('/:id', validationRules.updateHolding, holdingController.updateHolding);

// DELETE /api/holdings/:id - Delete holding
router.delete('/:id', holdingController.deleteHolding);

module.exports = router;