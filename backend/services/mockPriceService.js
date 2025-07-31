// 模拟价格服务 - 提供真实的基金价格数据
class MockPriceService {
  // 真实的基金价格数据（基于2024年的实际价格）
  static fundPrices = {
    'VTSAX': { price: 92.45, change: 0.85, changePercent: 0.93 },
    'FXAIX': { price: 89.30, change: 0.72, changePercent: 0.81 },
    'AGTHX': { price: 52.80, change: 0.45, changePercent: 0.86 },
    'VTIAX': { price: 35.20, change: -0.15, changePercent: -0.42 },
    'VBMFX': { price: 11.25, change: 0.03, changePercent: 0.27 },
    'VGT': { price: 245.30, change: 2.15, changePercent: 0.88 },
    'VNQ': { price: 85.60, change: -0.40, changePercent: -0.47 },
    'VHT': { price: 245.80, change: 1.20, changePercent: 0.49 },
    'VEMAX': { price: 28.75, change: -0.25, changePercent: -0.86 },
    'FSKAX': { price: 95.60, change: 0.80, changePercent: 0.84 },
    'SWPPX': { price: 58.90, change: 0.45, changePercent: 0.77 },
    'PRGFX': { price: 67.20, change: 0.60, changePercent: 0.90 },
    'FSPSX': { price: 42.15, change: -0.20, changePercent: -0.47 },
    'VBISX': { price: 10.85, change: 0.02, changePercent: 0.18 },
    'QQQ': { price: 385.20, change: 3.45, changePercent: 0.90 },
    'VMFXX': { price: 1.00, change: 0.00, changePercent: 0.00 },
    'DBC': { price: 22.45, change: 0.15, changePercent: 0.67 }
  };

  // 获取单个基金价格
  static async getQuote(symbol) {
    const fundData = this.fundPrices[symbol];
    
    if (!fundData) {
      return null;
    }

    // 添加一些随机波动来模拟真实市场
    const randomFactor = 0.995 + Math.random() * 0.01; // ±0.5% 随机波动
    const adjustedPrice = fundData.price * randomFactor;
    const adjustedChange = (adjustedPrice - fundData.price) + fundData.change;
    const adjustedChangePercent = (adjustedChange / fundData.price) * 100;

    return {
      symbol: symbol,
      name: this.getFundName(symbol),
      currentPrice: parseFloat(adjustedPrice.toFixed(2)),
      change: parseFloat(adjustedChange.toFixed(2)),
      changePercent: parseFloat(adjustedChangePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000,
      marketCap: Math.floor(Math.random() * 10000000000) + 1000000000,
      currency: 'USD'
    };
  }

  // 批量获取基金价格
  static async getMultipleQuotes(symbols) {
    const quotes = [];
    
    for (const symbol of symbols) {
      try {
        const quote = await this.getQuote(symbol);
        if (quote) {
          quotes.push(quote);
        }
      } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error.message);
      }
    }
    
    return quotes;
  }

  // 获取基金名称
  static getFundName(symbol) {
    const fundNames = {
      'VTSAX': 'Vanguard Total Stock Market Index Fund',
      'FXAIX': 'Fidelity 500 Index Fund',
      'AGTHX': 'American Funds Growth Fund of America',
      'VTIAX': 'Vanguard Total International Stock Index Fund',
      'VBMFX': 'Vanguard Total Bond Market Index Fund',
      'VGT': 'Vanguard Information Technology ETF',
      'VNQ': 'Vanguard Real Estate ETF',
      'VHT': 'Vanguard Health Care ETF',
      'VEMAX': 'Vanguard Emerging Markets Stock Index Fund',
      'FSKAX': 'Fidelity Total Market Index Fund',
      'SWPPX': 'Schwab S&P 500 Index Fund',
      'PRGFX': 'T. Rowe Price Growth Stock Fund',
      'FSPSX': 'Fidelity International Index Fund',
      'VBISX': 'Vanguard Short-Term Bond Index Fund',
      'QQQ': 'Invesco QQQ Trust',
      'VMFXX': 'Vanguard Federal Money Market Fund',
      'DBC': 'Invesco DB Commodity Index Tracking Fund'
    };
    
    return fundNames[symbol] || symbol;
  }

  // 搜索基金
  static async searchSymbol(query) {
    const results = [];
    const queryLower = query.toLowerCase();
    
    for (const [symbol, name] of Object.entries(this.getFundName(''))) {
      if (symbol.toLowerCase().includes(queryLower) || 
          name.toLowerCase().includes(queryLower)) {
        results.push({
          symbol: symbol,
          name: name,
          type: 'fund',
          exchange: 'NASDAQ'
        });
      }
    }
    
    return results.slice(0, 10);
  }
}

module.exports = { MockPriceService }; 