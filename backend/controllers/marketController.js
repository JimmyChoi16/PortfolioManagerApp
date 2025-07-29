const { YahooFinanceService, SinaFinanceService } = require('../services/yahooFinanceService');
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

      const searchResults = await YahooFinanceService.searchSymbol(query);
      
      res.json({
        success: true,
        data: searchResults
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

      const quote = await YahooFinanceService.getQuote(symbol.toUpperCase());
      
      if (!quote) {
        return res.status(404).json({
          success: false,
          message: `Quote not found for symbol: ${symbol}`
        });
      }

      res.json({
        success: true,
        data: quote
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

  // Get quotes for multiple symbols
  async getMultipleQuotes(req, res) {
    try {
      const { symbols } = req.body;
      
      if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Symbols array is required and must not be empty'
        });
      }

      const quotes = await YahooFinanceService.getMultipleQuotes(
        symbols.map(s => s.toUpperCase())
      );
      
      res.json({
        success: true,
        data: quotes
      });
    } catch (error) {
      console.error('Error fetching multiple quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quotes',
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

      const historicalData = await YahooFinanceService.getHistoricalData(
        symbol.toUpperCase(),
        period,
        interval
      );
      
      res.json({
        success: true,
        data: {
          symbol: symbol.toUpperCase(),
          period,
          interval,
          data: historicalData
        }
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
      
      const quotes = await YahooFinanceService.getMultipleQuotes(popularSymbols);
      
      // Sort by change percent (highest gainers first)
      const sortedQuotes = quotes.sort((a, b) => b.changePercent - a.changePercent);
      
      res.json({
        success: true,
        data: sortedQuotes
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

  // Get public quotes for homepage (no auth required)
  async getPublicQuotes(req, res) {
    try {
      // 可根据需要调整默认展示的资产
      const symbols = [
        'AAPL', 'TSLA', 'SPY', 'MSFT', 'GOOGL', 'BND', 'QQQ', 'VTI', 'MCHI', 'AGG'
      ];
      const quotes = await SinaFinanceService.getSinaQuotes(symbols);
      res.json({
        success: true,
        data: quotes
      });
    } catch (error) {
      console.error('Error fetching public quotes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch public quotes',
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