const express = require('express');
const router = express.Router();
const bondController = require('../controllers/bondController');

// GET /api/bonds - Get all bonds
router.get('/', bondController.getAllBonds);

// GET /api/bonds/stats - Get bond statistics by type
router.get('/stats', bondController.getBondStats);

// GET /api/bonds/:id - Get bond by ID
router.get('/:id', bondController.getBondById);

// POST /api/bonds - Create new bond
router.post('/', bondController.createBond);

// PUT /api/bonds/:id - Update bond
router.put('/:id', bondController.updateBond);

// DELETE /api/bonds/:id - Delete bond
router.delete('/:id', bondController.deleteBond);

module.exports = router; 