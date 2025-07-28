const yahooFinance = require('yahoo-finance2').default;

class YahooFinanceService {
  static async getQuote(symbol) {
    try {
      const quote = await yahooFinance.quoteSummary(symbol, {
        modules: ['price', 'summaryDetail']
      });
      
      if (quote && quote.price) {
        return {
          symbol: symbol,
          name: quote.price.shortName || quote.price.longName || symbol,
          currentPrice: quote.price.regularMarketPrice || 0,
          change: quote.price.regularMarketChange || 0,
          changePercent: quote.price.regularMarketChangePercent ? 
                        (quote.price.regularMarketChangePercent * 100) : 0,
          volume: quote.price.regularMarketVolume || 0,
          marketCap: quote.summaryDetail?.marketCap || 0,
          currency: quote.price.currency || 'USD'
        };
      }
      return null;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      return null;
    }
  }

  static async getMultipleQuotes(symbols) {
    try {
      const quotes = await Promise.allSettled(
        symbols.map(symbol => this.getQuote(symbol))
      );
      
      return quotes
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value);
    } catch (error) {
      console.error('Error fetching multiple quotes:', error.message);
      return [];
    }
  }

  static async searchSymbol(query) {
    try {
      const searchResult = await yahooFinance.search(query);
      
      if (searchResult && searchResult.quotes) {
        return searchResult.quotes
          .filter(quote => quote.typeDisp === 'Equity' || quote.typeDisp === 'ETF')
          .slice(0, 10)
          .map(quote => ({
            symbol: quote.symbol,
            name: quote.shortname || quote.longname || quote.symbol,
            type: quote.typeDisp === 'ETF' ? 'fund' : 'stock',
            exchange: quote.exchange
          }));
      }
      return [];
    } catch (error) {
      console.error(`Error searching for ${query}:`, error.message);
      return [];
    }
  }

  static async getHistoricalData(symbol, period = '1mo', interval = '1d') {
    try {
      const result = await yahooFinance.historical(symbol, {
        period1: this.getPeriodDate(period),
        period2: new Date(),
        interval: interval
      });
      
      if (result && result.length > 0) {
        return result.map(item => ({
          date: item.date,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
          volume: item.volume
        }));
      }
      return [];
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error.message);
      return [];
    }
  }

  static getPeriodDate(period) {
    const now = new Date();
    const periods = {
      '1d': 1,
      '5d': 5,
      '1mo': 30,
      '3mo': 90,
      '6mo': 180,
      '1y': 365,
      '2y': 730,
      '5y': 1825,
      '10y': 3650
    };
    
    const days = periods[period] || 30;
    return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  }
}

module.exports = YahooFinanceService;