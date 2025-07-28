const yahooFinance = require('yahoo-finance2').default;
const axios = require('axios');

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

class SinaFinanceService {
  /**
   * symbols: ['AAPL', 'TSLA', ...]，美股需加 gb_ 前缀
   * 支持美股、港股、A股、ETF等
   */
  static async getSinaQuotes(symbols) {
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) return [];
    // 新浪美股接口格式：gb_aapl,gb_tsla
    const sinaSymbols = symbols.map(s => `gb_${s.toLowerCase()}`);
    const url = `https://hq.sinajs.cn/list=${sinaSymbols.join(',')}`;
    try {
      const res = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://finance.sina.com.cn'
        }
      });
      // 新浪返回GBK编码，需要转码
      const iconv = require('iconv-lite');
      const text = iconv.decode(res.data, 'GB18030');
      // 解析数据
      const lines = text.split(';');
      const result = [];
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // var hq_str_gb_aapl="Apple Inc.,192.32,1.23,0.65,191.00,193.00,1000000,2024-06-28 16:00:00";
        const match = line.match(/var hq_str_gb_(\w+)=\"([^\"]*)\"/);
        if (!match) continue;
        const symbol = match[1].toUpperCase();
        const fields = match[2].split(',');
        if (fields.length < 8) continue;
        result.push({
          symbol,
          name: fields[0],
          currentPrice: parseFloat(fields[1]),
          change: parseFloat(fields[2]),
          changePercent: parseFloat(fields[3]),
          open: parseFloat(fields[4]),
          high: parseFloat(fields[5]),
          volume: parseInt(fields[6]),
          time: fields[7]
        });
      }
      return result;
    } catch (e) {
      console.error('Sina quote fetch error:', e.message);
      return [];
    }
  }
}

module.exports = { YahooFinanceService, SinaFinanceService };