const { SinaFinanceService, TencentFinanceService } = require('../services/yahooFinanceService');
const { pool } = require('../config/database');

const marketController = {
  // Search for stocks/symbols
  async searchSymbols(req, res) {
    try {
      const { query } = req.query;

      if (!query || query.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Query parameter must be at least 2 characters long'
        });
      }

      // This endpoint is no longer used as YahooFinanceService is removed.
      // Keeping it for now as it might be re-introduced or replaced later.
      // For now, it will return a placeholder message.
      res.json({
        success: true,
        message: 'Search functionality is currently unavailable.'
      });
    } catch (error) {
      console.error('Error searching symbols:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search symbols',
        error: error.message
      });
    }
  },

  // Get quote for a specific symbol
  async getQuote(req, res) {
    try {
      const { symbol } = req.params;

      if (!symbol) {
        return res.status(400).json({
          success: false,
          message: 'Symbol parameter is required'
        });
      }

      // This endpoint is no longer used as YahooFinanceService is removed.
      // Keeping it for now as it might be re-introduced or replaced later.
      // For now, it will return a placeholder message.
      res.json({
        success: true,
        message: 'Quote functionality is currently unavailable.'
      });
    } catch (error) {
      console.error('Error fetching quote:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quote',
        error: error.message
      });
    }
  },

  // Get quotes for multiple US stock symbols (美股)
  async getUsMultipleQuotes(req, res) {
    try {
      const { symbols } = req.body;
      if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Symbols array is required and must not be empty'
        });
      }
      const quotes = await SinaFinanceService.getSinaQuotes(symbols);
      res.json({
        success: true,
        data: quotes
      });
    } catch (error) {
      console.error('Error fetching US multiple quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch US quotes',
        error: error.message
      });
    }
  },

  // Get quotes for multiple CN stock symbols (A股)
  async getCnMultipleQuotes(req, res) {
    try {
      const { symbols } = req.body;
      if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Symbols array is required and must not be empty'
        });
      }
      const quotes = await TencentFinanceService.getTencentQuotes(symbols);
      res.json({
        success: true,
        data: quotes
      });
    } catch (error) {
      console.error('Error fetching CN multiple quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch CN quotes',
        error: error.message
      });
    }
  },

  // Get historical data for a symbol
  async getHistoricalData(req, res) {
    try {
      const { symbol } = req.params;
      const { period = '1mo', interval = '1d' } = req.query;

      if (!symbol) {
        return res.status(400).json({
          success: false,
          message: 'Symbol parameter is required'
        });
      }

      // This endpoint is no longer used as YahooFinanceService is removed.
      // Keeping it for now as it might be re-introduced or replaced later.
      // For now, it will return a placeholder message.
      res.json({
        success: true,
        message: 'Historical data functionality is currently unavailable.'
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

  // Get trending stocks or popular symbols
  async getTrendingStocks(req, res) {
    try {
      // Popular tech stocks for demo
      const popularSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'NFLX'];

      // This endpoint is no longer used as YahooFinanceService is removed.
      // Keeping it for now as it might be re-introduced or replaced later.
      // For now, it will return a placeholder message.
      res.json({
        success: true,
        message: 'Trending stocks functionality is currently unavailable.'
      });
    } catch (error) {
      console.error('Error fetching trending stocks:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch trending stocks',
        error: error.message
      });
    }
  },

  // Get US stock quotes for homepage (no auth required)
  async getUsStockQuotes(req, res) {
    try {
      const symbols = [
        'AAPL', 'TSLA', 'SPY', 'MSFT', 'GOOGL', 'BND', 'QQQ', 'VTI', 'MCHI', 'AGG'
      ];
      const quotes = await SinaFinanceService.getSinaQuotes(symbols);
      res.json({
        success: true,
        data: quotes
      });
    } catch (error) {
      console.error('Error fetching US stock quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch US stock quotes',
        error: error.message
      });
    }
  },

  // Get CN (A-share) stock quotes for homepage
  async getCnStockQuotes(req, res) {
    try {
      const symbols = [
        'sh600519', 'sh601318', 'sh600036', 'sh601166', 'sz000858',
        'sh601888', 'sz000333', 'sh600276', 'sh601398', 'sh601988'
      ];
      const quotes = await TencentFinanceService.getTencentQuotes(symbols);
      res.json({
        success: true,
        data: quotes
      });
    } catch (error) {
      console.error('Error fetching CN stock quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch CN stock quotes',
        error: error.message
      });
    }
  },

  // Get all active recommendations
  async getRecommendations(req, res) {
    try {
      const [rows] = await pool.execute(`
        SELECT * FROM simple_recommendations 
        WHERE (expires_at IS NULL OR expires_at > NOW()) 
        ORDER BY created_at DESC
      `);

      res.json({
        success: true,
        data: rows
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recommendations',
        error: error.message
      });
    }
  },

  // Get recommendation for specific symbol
  async getRecommendationBySymbol(req, res) {
    try {
      const { symbol } = req.params;

      const [rows] = await pool.execute(`
        SELECT * FROM simple_recommendations 
        WHERE symbol = ? AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC 
        LIMIT 1
      `, [symbol.toUpperCase()]);

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `No active recommendation found for symbol: ${symbol}`
        });
      }

      res.json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recommendation',
        error: error.message
      });
    }
  }
};

module.exports = marketController;