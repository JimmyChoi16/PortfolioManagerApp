const Holding = require('../models/Holding');
const Fund = require('../models/Fund');
const { YahooFinanceService } = require('../services/yahooFinanceService');
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
      
      // Get current price from Yahoo Finance
      let current_price = purchase_price;
      try {
        const quote = await YahooFinanceService.getQuote(symbol);
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
      
      const quotes = await YahooFinanceService.getMultipleQuotes(symbols);
      
      for (const quote of quotes) {
        await Holding.updateCurrentPrice(quote.symbol, quote.currentPrice);
      }

      res.json({
        success: true,
        message: `Updated prices for ${quotes.length} symbols`,
        data: quotes
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
  },

  // Get all funds (holdings with type 'fund')
  async getFunds(req, res) {
    try {
      const funds = await Fund.getAll();
      res.json({
        success: true,
        data: funds
      });
    } catch (error) {
      console.error('Error fetching funds:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch funds',
        error: error.message
      });
    }
  },

  // Get fund categories analysis
  async getFundCategories(req, res) {
    try {
      const categories = await Fund.getCategories();
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Error fetching fund categories:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch fund categories',
        error: error.message
      });
    }
  },

  // Get fund performance data
  async getFundPerformance(req, res) {
    try {
      const performance = await Fund.getPerformance();
      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      console.error('Error fetching fund performance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch fund performance',
        error: error.message
      });
    }
  },

  // Get fund volatility data
  async getFundVolatility(req, res) {
    try {
      const { symbol } = req.params;
      const volatility = await Fund.getVolatility(symbol);
      res.json({
        success: true,
        data: volatility
      });
    } catch (error) {
      console.error('Error fetching fund volatility:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch fund volatility',
        error: error.message
      });
    }
  },

  // Search funds
  async searchFunds(req, res) {
    try {
      const { q } = req.query;
      const funds = await Fund.search(q);
      res.json({
        success: true,
        data: funds
      });
    } catch (error) {
      console.error('Error searching funds:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search funds',
        error: error.message
      });
    }
  },

  // Execute trade
  async executeTrade(req, res) {
    try {
      const { symbol, action, quantity, price, notes } = req.body;
      
      if (action === 'buy') {
        // Check if fund already exists
        const existingFund = await Fund.getBySymbol(symbol);
        
        if (existingFund) {
          // Update existing holding
          const newQuantity = existingFund.quantity + parseFloat(quantity);
          const avgPrice = ((existingFund.quantity * existingFund.purchase_price) + 
                           (parseFloat(quantity) * parseFloat(price))) / newQuantity;
          
          await Holding.update(existingFund.id, {
            quantity: newQuantity,
            purchase_price: avgPrice,
            current_price: parseFloat(price)
          });
        } else {
          // Create new holding
          await Holding.create({
            symbol: symbol.toUpperCase(),
            name: symbol, // Will be updated with real name later
            type: 'fund',
            quantity: parseFloat(quantity),
            purchase_price: parseFloat(price),
            purchase_date: new Date().toISOString().split('T')[0],
            current_price: parseFloat(price),
            sector: 'Unknown',
            notes: notes || ''
          });
        }
      } else if (action === 'sell') {
        const existingFund = await Fund.getBySymbol(symbol);
        
        if (!existingFund) {
          return res.status(404).json({
            success: false,
            message: 'Fund not found in holdings'
          });
        }
        
        if (existingFund.quantity < parseFloat(quantity)) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient quantity to sell'
          });
        }
        
        const newQuantity = existingFund.quantity - parseFloat(quantity);
        
        if (newQuantity === 0) {
          // Delete the holding if quantity becomes 0
          await Holding.delete(existingFund.id);
        } else {
          // Update the holding
          await Holding.update(existingFund.id, {
            quantity: newQuantity,
            current_price: parseFloat(price)
          });
        }
      }
      
      res.json({
        success: true,
        message: `${action} order executed successfully`
      });
    } catch (error) {
      console.error('Error executing trade:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute trade',
        error: error.message
      });
    }
  }
};

module.exports = holdingController;