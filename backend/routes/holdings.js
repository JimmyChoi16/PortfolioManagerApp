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

// GET /api/holdings/:id - Get holding by ID
router.get('/:id', holdingController.getHoldingById);

// POST /api/holdings - Create new holding
router.post('/', validationRules.createHolding, holdingController.createHolding);

// PUT /api/holdings/:id - Update holding
router.put('/:id', validationRules.updateHolding, holdingController.updateHolding);

// DELETE /api/holdings/:id - Delete holding
router.delete('/:id', holdingController.deleteHolding);

module.exports = router;