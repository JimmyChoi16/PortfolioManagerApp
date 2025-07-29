const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

// 创建投资组合
router.post('/', portfolioController.createPortfolio);

module.exports = router; 