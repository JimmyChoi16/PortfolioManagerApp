const Holding = require('../models/Holding');
const Fund = require('../models/Fund');
const { SinaFinanceService, TencentFinanceService } = require('../services/yahooFinanceService');
const { MockPriceService } = require('../services/mockPriceService');
const { pool } = require('../config/database');
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

  // Update fund prices with real-time data
  async updateFundPrices(req, res) {
    try {
      // 获取所有基金
      const funds = await Fund.getAll();
      const symbols = [...new Set(funds.map(f => f.symbol))];
      
      console.log(`Updating prices for ${symbols.length} funds:`, symbols);
      
      // 获取实时价格 - 使用模拟服务
      const quotes = await MockPriceService.getMultipleQuotes(symbols);
      
      let updatedCount = 0;
      const updateResults = [];
      
              for (const quote of quotes) {
          if (quote && quote.currentPrice > 0) {
            try {
              const affectedRows = await Holding.updateCurrentPrice(quote.symbol, quote.currentPrice);
              if (affectedRows > 0) {
                updatedCount++;
                updateResults.push({
                  symbol: quote.symbol,
                  oldPrice: funds.find(f => f.symbol === quote.symbol)?.current_price || 0,
                  newPrice: quote.currentPrice,
                  change: quote.change,
                  changePercent: quote.changePercent
                });
                console.log(`Updated ${quote.symbol}: $${quote.currentPrice}`);
              } else {
                console.log(`No rows affected for ${quote.symbol}`);
              }
            } catch (error) {
              console.error(`Error updating price for ${quote.symbol}:`, error);
            }
          }
        }

      // 更新投资组合历史记录
      if (updatedCount > 0) {
        await holdingController.updatePortfolioHistory();
      }

      res.json({
        success: true,
        message: `Updated prices for ${updatedCount} funds`,
        data: {
          updatedCount,
          updates: updateResults,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error updating fund prices:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update fund prices',
        error: error.message
      });
    }
  },

  // Update portfolio history
  async updatePortfolioHistory() {
    try {
      const holdings = await Holding.getAll();
      const totalValue = holdings.reduce((sum, h) => sum + (h.current_price * h.quantity), 0);
      
      const [result] = await pool.execute(
        'INSERT INTO portfolio_history (date, total_value, daily_change) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE total_value = ?, daily_change = ?',
        [
          new Date().toISOString().split('T')[0],
          totalValue,
          0, // 暂时设为0，可以后续计算
          totalValue,
          0
        ]
      );
      
      console.log('Portfolio history updated');
    } catch (error) {
      console.error('Error updating portfolio history:', error);
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

  // Get detailed history analysis
  async getDetailedHistoryAnalysis(req, res) {
    try {
      const analysisData = await Holding.getDetailedHistoryAnalysis();
      res.json({
        success: true,
        data: analysisData
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

  // Add fund holdings
  async addFundHoldings(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { symbol, name, sector, quantity, purchase_price, purchase_date, notes } = req.body;
      
      // Get current price from mock service for funds
      let current_price = purchase_price;
      try {
        const quotes = await MockPriceService.getMultipleQuotes([symbol.toUpperCase()]);
        if (quotes && quotes.length > 0 && quotes[0].currentPrice > 0) {
          current_price = quotes[0].currentPrice;
        }
      } catch (error) {
        console.warn('Could not fetch current price, using purchase price');
      }

      const holdingData = {
        symbol: symbol.toUpperCase(),
        name,
        type: 'fund',
        quantity: parseFloat(quantity),
        purchase_price: parseFloat(purchase_price),
        purchase_date,
        current_price,
        sector,
        notes: notes || ''
      };

      const holdingId = await Holding.create(holdingData);
      const newHolding = await Holding.getById(holdingId);

      res.status(201).json({
        success: true,
        message: 'Fund holdings added successfully',
        data: newHolding
      });
    } catch (error) {
      console.error('Error adding fund holdings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add fund holdings',
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
    
    // 添加调试信息
    console.log('Received trade request:', req.body)
    console.log('Quantity raw:', quantity, 'Type:', typeof quantity)
    console.log('Price raw:', price, 'Type:', typeof price)
    
    // 验证输入参数
    if (!symbol || !action || !quantity || !price) {
        return res.status(400).json({
          success: false,
          message: 'Missing required parameters: symbol, action, quantity, price'
        });
      }
      
          const parsedQuantity = parseFloat(quantity);
    const parsedPrice = parseFloat(price);
    
    console.log('Parsed quantity:', parsedQuantity, 'Type:', typeof parsedQuantity)
    console.log('Parsed price:', parsedPrice, 'Type:', typeof parsedPrice)
    
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid quantity'
        });
      }
      
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid price'
        });
      }
      
      if (action === 'buy') {
        // Check if fund already exists
        const existingFund = await Fund.getBySymbol(symbol);
        
        if (existingFund) {
          // Update existing holding
          // 确保从数据库返回的字符串值被转换为数字
          const existingQuantity = parseFloat(existingFund.quantity);
          const existingPurchasePrice = parseFloat(existingFund.purchase_price);
          
          const newQuantity = existingQuantity + parsedQuantity;
          const avgPrice = ((existingQuantity * existingPurchasePrice) + 
                           (parsedQuantity * parsedPrice)) / newQuantity;
          
          console.log('Existing fund data:', {
            id: existingFund.id,
            quantity: existingFund.quantity,
            quantityType: typeof existingFund.quantity,
            purchase_price: existingFund.purchase_price,
            purchase_priceType: typeof existingFund.purchase_price
          });
          console.log('Converted values:', {
            existingQuantity: existingQuantity,
            existingPurchasePrice: existingPurchasePrice
          });
          console.log('Calculated values:', {
            newQuantity: newQuantity,
            avgPrice: avgPrice,
            current_price: parsedPrice
          });
          console.log('Types:', {
            newQuantityType: typeof newQuantity,
            avgPriceType: typeof avgPrice,
            currentPriceType: typeof parsedPrice
          });
          
          await Holding.update(existingFund.id, {
            quantity: newQuantity,
            purchase_price: avgPrice,
            current_price: parsedPrice
          });
        } else {
          // Create new holding
          await Holding.create({
            symbol: symbol.toUpperCase(),
            name: symbol, // Will be updated with real name later
            type: 'fund',
            quantity: parsedQuantity,
            purchase_price: parsedPrice,
            purchase_date: new Date().toISOString().split('T')[0],
            current_price: parsedPrice,
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
        
        // 确保从数据库返回的字符串值被转换为数字
        const existingQuantity = parseFloat(existingFund.quantity);
        
        if (existingQuantity < parsedQuantity) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient quantity to sell'
          });
        }
        
        const newQuantity = existingQuantity - parsedQuantity;
        
        if (newQuantity === 0) {
          // Delete the holding if quantity becomes 0
          await Holding.delete(existingFund.id);
        } else {
          // Update the holding
          await Holding.update(existingFund.id, {
            quantity: newQuantity,
            current_price: parsedPrice
          });
        }
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Must be "buy" or "sell"'
        });
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
  },

  // Get real-time performance metrics
  async getRealTimePerformanceMetrics(req, res) {
    try {
      const metrics = await Holding.getRealTimePerformanceMetrics();
      res.json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Error fetching real-time performance metrics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch real-time performance metrics',
        error: error.message
      });
    }
  },

  // Update portfolio history
  async updatePortfolioHistory(req, res) {
    try {
      await Holding.updatePortfolioHistory();
      res.json({
        success: true,
        message: 'Portfolio history updated successfully'
      });
    } catch (error) {
      console.error('Error updating portfolio history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update portfolio history',
        error: error.message
      });
    }
  }
};

module.exports = holdingController;