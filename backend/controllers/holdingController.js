const Holding = require('../models/Holding');
const { SinaFinanceService, TencentFinanceService } = require('../services/yahooFinanceService');
const { validationResult } = require('express-validator');

const holdingController = {
  // Get all holdings
  async getAllHoldings(req, res) {
    try {
      const holdings = await Holding.getAll();
      res.json({
        success: true,
        data: holdings
      });
    } catch (error) {
      console.error('Error fetching holdings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch holdings',
        error: error.message
      });
    }
  },

  // Get holding by ID
  async getHoldingById(req, res) {
    try {
      const { id } = req.params;
      const holding = await Holding.getById(id);
      
      if (!holding) {
        return res.status(404).json({
          success: false,
          message: 'Holding not found'
        });
      }

      res.json({
        success: true,
        data: holding
      });
    } catch (error) {
      console.error('Error fetching holding:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch holding',
        error: error.message
      });
    }
  },

  // Create new holding
  async createHolding(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { symbol, name, type, quantity, purchase_price, purchase_date, sector, notes } = req.body;
      
      // Get current price from appropriate market service
      let current_price = purchase_price;
      try {
        const isAStock = /^S[HZ]/.test(symbol.toUpperCase());
        let quote = null;
        
        if (isAStock) {
          // Get A股 current price
          const quotes = await TencentFinanceService.getTencentQuotes([symbol.toUpperCase()]);
          if (quotes && quotes.length > 0) {
            quote = quotes[0];
          }
        } else {
          // Get US stock current price
          const quotes = await SinaFinanceService.getSinaQuotes([symbol.toUpperCase()]);
          if (quotes && quotes.length > 0) {
            quote = quotes[0];
          }
        }
        
        if (quote && quote.currentPrice) {
          current_price = quote.currentPrice;
        }
      } catch (error) {
        console.warn('Could not fetch current price, using purchase price');
      }

      const holdingData = {
        symbol: symbol.toUpperCase(),
        name,
        type,
        quantity: parseFloat(quantity),
        purchase_price: parseFloat(purchase_price),
        purchase_date,
        current_price,
        sector,
        notes
      };

      const holdingId = await Holding.create(holdingData);
      const newHolding = await Holding.getById(holdingId);

      res.status(201).json({
        success: true,
        message: 'Holding created successfully',
        data: newHolding
      });
    } catch (error) {
      console.error('Error creating holding:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create holding',
        error: error.message
      });
    }
  },

  // Update holding
  async updateHolding(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes } = req.body;

      const holdingData = {
        symbol: symbol.toUpperCase(),
        name,
        type,
        quantity: parseFloat(quantity),
        purchase_price: parseFloat(purchase_price),
        purchase_date,
        current_price: parseFloat(current_price),
        sector,
        notes
      };

      const updated = await Holding.update(id, holdingData);
      
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Holding not found'
        });
      }

      const updatedHolding = await Holding.getById(id);
      res.json({
        success: true,
        message: 'Holding updated successfully',
        data: updatedHolding
      });
    } catch (error) {
      console.error('Error updating holding:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update holding',
        error: error.message
      });
    }
  },

  // Delete holding
  async deleteHolding(req, res) {
    try {
      const { id } = req.params;
      const deleted = await Holding.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Holding not found'
        });
      }

      res.json({
        success: true,
        message: 'Holding deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting holding:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete holding',
        error: error.message
      });
    }
  },

  // Get portfolio summary
  async getPortfolioSummary(req, res) {
    try {
      const portfolioData = await Holding.getPortfolioSummary();
      res.json({
        success: true,
        data: portfolioData
      });
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch portfolio summary',
        error: error.message
      });
    }
  },

  // Get historical performance data
  async getHistoricalData(req, res) {
    try {
      const historicalData = await Holding.getHistoricalData();
      res.json({
        success: true,
        data: historicalData
      });
    } catch (error) {
      console.error('Error fetching historical data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch historical data',
        error: error.message
      });
    }
  },

  // Update current prices for all holdings
  async updateCurrentPrices(req, res) {
    try {
      const holdings = await Holding.getAll();
      const symbols = [...new Set(holdings.map(h => h.symbol))];
      
      // Separate A股 and US stocks
      const aStockSymbols = symbols.filter(s => /^S[HZ]/.test(s));
      const usStockSymbols = symbols.filter(s => !/^S[HZ]/.test(s));
      
      let allQuotes = [];
      
      // Get A股 quotes
      if (aStockSymbols.length > 0) {
        const aStockQuotes = await TencentFinanceService.getTencentQuotes(aStockSymbols);
        allQuotes = allQuotes.concat(aStockQuotes);
      }
      
      // Get US stock quotes
      if (usStockSymbols.length > 0) {
        const usStockQuotes = await SinaFinanceService.getSinaQuotes(usStockSymbols);
        allQuotes = allQuotes.concat(usStockQuotes);
      }
      
      for (const quote of allQuotes) {
        await Holding.updateCurrentPrice(quote.symbol, quote.currentPrice);
      }

      res.json({
        success: true,
        message: `Updated prices for ${allQuotes.length} symbols`,
        data: allQuotes
      });
    } catch (error) {
      console.error('Error updating current prices:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update current prices',
        error: error.message
      });
    }
  },

  // Get asset allocation analysis
  async getAllocationAnalysis(req, res) {
    try {
      const allocationData = await Holding.getAllocationAnalysis();
      res.json({
        success: true,
        data: allocationData
      });
    } catch (error) {
      console.error('Error fetching allocation analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch allocation analysis',
        error: error.message
      });
    }
  },

  // Get performance analysis
  async getPerformanceAnalysis(req, res) {
    try {
      const performanceData = await Holding.getPerformanceAnalysis();
      res.json({
        success: true,
        data: performanceData
      });
    } catch (error) {
      console.error('Error fetching performance analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch performance analysis',
        error: error.message
      });
    }
  },

  // Get sector analysis
  async getSectorAnalysis(req, res) {
    try {
      const sectorData = await Holding.getSectorAnalysis();
      res.json({
        success: true,
        data: sectorData
      });
    } catch (error) {
      console.error('Error fetching sector analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch sector analysis',
        error: error.message
      });
    }
  },

  // Get detailed historical analysis
  async getDetailedHistoryAnalysis(req, res) {
    try {
      const historyData = await Holding.getDetailedHistoryAnalysis();
      res.json({
        success: true,
        data: historyData
      });
    } catch (error) {
      console.error('Error fetching detailed history analysis:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch detailed history analysis',
        error: error.message
      });
    }
  }
};

module.exports = holdingController;