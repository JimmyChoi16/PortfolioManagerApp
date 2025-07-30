const { pool } = require('../config/database');

class Fund {
  // Get all funds with holding information
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT 
        h.id,
        h.symbol,
        h.name,
        h.type,
        h.quantity,
        h.purchase_price,
        h.purchase_date,
        h.current_price,
        h.sector,
        h.notes,
        h.is_active,
        'index' as fund_type,
        0.15 as expense_ratio,
        10.0 as ytd_return,
        15.0 as return_1y,
        12.0 as volatility_3y,
        10.0 as volatility_1y,
        8.0 as volatility_6m,
        5.0 as volatility_3m,
        ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
        ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
        ROUND(h.current_price * h.quantity, 2) as current_value
      FROM holdings h
      WHERE h.type = 'fund' AND h.is_active = TRUE
      ORDER BY h.created_at DESC
    `);
    return rows;
  }

  // Get fund by symbol
  static async getBySymbol(symbol) {
    const [rows] = await pool.execute(`
      SELECT 
        h.id,
        h.symbol,
        h.name,
        h.type,
        h.quantity,
        h.purchase_price,
        h.purchase_date,
        h.current_price,
        h.sector,
        h.notes,
        h.is_active,
        'index' as fund_type,
        0.15 as expense_ratio,
        10.0 as ytd_return,
        15.0 as return_1y,
        12.0 as volatility_3y,
        10.0 as volatility_1y,
        8.0 as volatility_6m,
        5.0 as volatility_3m,
        ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
        ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
        ROUND(h.current_price * h.quantity, 2) as current_value
      FROM holdings h
      WHERE h.symbol = ? AND h.type = 'fund' AND h.is_active = TRUE
    `, [symbol]);
    return rows[0];
  }

  // Get fund categories analysis
  static async getCategories() {
    const [rows] = await pool.execute(`
      SELECT 
        h.sector as type,
        COUNT(*) as count,
        ROUND(SUM(h.quantity * h.current_price), 2) as value,
        ROUND(SUM(h.quantity * h.current_price) / (SELECT SUM(quantity * current_price) FROM holdings WHERE type = 'fund' AND is_active = TRUE) * 100, 2) as percentage
      FROM holdings h
      WHERE h.type = 'fund' AND h.is_active = TRUE
      GROUP BY h.sector
      ORDER BY value DESC
    `);
    
    // 为每个类别计算真实的YTD回报率和合理的费用比率
    const categoriesWithCalculatedData = await Promise.all(
      rows.map(async (row) => {
        // 获取该类别下所有基金的符号
        const [fundSymbols] = await pool.execute(`
          SELECT symbol FROM holdings 
          WHERE type = 'fund' AND is_active = TRUE AND sector = ?
        `, [row.type]);
        
        // 计算该类别所有基金的YTD回报率
        let totalYtdReturn = 0;
        let validFunds = 0;
        
        for (const fund of fundSymbols) {
          const ytdReturn = await this.calculateYtdReturn(fund.symbol);
          if (ytdReturn !== null) {
            totalYtdReturn += ytdReturn;
            validFunds++;
          }
        }
        
        const avgYtdReturn = validFunds > 0 ? totalYtdReturn / validFunds : 0;
        
        // 根据基金类型生成合理的费用比率
        const expenseRatio = this.generateExpenseRatio(row.type);
        
        return {
          type: row.type || 'Unknown',
          count: row.count || 0,
          value: row.value || 0,
          ytd: Math.round(avgYtdReturn * 100) / 100, // 保留两位小数
          expense_ratio: expenseRatio,
          percentage: row.percentage || 0
        };
      })
    );
    
    return categoriesWithCalculatedData;
  }

  // Get fund performance data with historical returns
  static async getPerformance() {
    const [rows] = await pool.execute(`
      SELECT 
        h.id,
        h.symbol,
        h.name,
        h.sector,
        h.quantity,
        h.current_price,
        h.purchase_price,
        h.purchase_date,
        ROUND(h.quantity * h.current_price, 2) as current_value,
        0.15 as expense_ratio
      FROM holdings h
      WHERE h.type = 'fund' AND h.is_active = TRUE
      ORDER BY current_value DESC
    `);

    // 为每个基金计算历史收益率
    const fundsWithReturns = await Promise.all(
      rows.map(async (fund) => {
        const returns = await this.calculateHistoricalReturns(fund.symbol);
        return {
          ...fund,
          ...returns
        };
      })
    );

    return fundsWithReturns;
  }

  // Calculate historical returns for a fund
  static async calculateHistoricalReturns(symbol) {
    try {
      // 获取最新价格和最新记录日期
      const [latestPriceRow] = await pool.execute(`
        SELECT price, record_date FROM fund_prices 
        WHERE symbol = ? 
        ORDER BY record_date DESC 
        LIMIT 1
      `, [symbol]);

      if (!latestPriceRow.length) {
        return {
          ytd: 0,
          return_1y: 0,
          return_3y: 0
        };
      }

      const currentPrice = parseFloat(latestPriceRow[0].price);
      const latestRecordDate = new Date(latestPriceRow[0].record_date);

      // 计算YTD收益率（从当前年份1月1日开始）
      const currentYear = new Date().getFullYear();
      const ytdStartDate = `${currentYear}-01-01`;
      const [ytdPriceRow] = await pool.execute(`
        SELECT price FROM fund_prices 
        WHERE symbol = ? AND record_date >= ?
        ORDER BY record_date ASC 
        LIMIT 1
      `, [symbol, ytdStartDate]);

      let ytd = 0;
      if (ytdPriceRow.length > 0) {
        const ytdPrice = parseFloat(ytdPriceRow[0].price);
        ytd = ((currentPrice - ytdPrice) / ytdPrice) * 100;
      }

      // 计算1年前的日期（相对于数据库中的最新日期）
      const oneYearAgo = new Date(latestRecordDate);
      oneYearAgo.setFullYear(latestRecordDate.getFullYear() - 1);
      const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

      // 计算3年前的日期
      const threeYearsAgo = new Date(latestRecordDate);
      threeYearsAgo.setFullYear(latestRecordDate.getFullYear() - 3);
      const threeYearsAgoStr = threeYearsAgo.toISOString().split('T')[0];

      // 获取1年前的价格（小于等于目标日期的最近价格）
      const [oneYearPriceRow] = await pool.execute(`
        SELECT price FROM fund_prices 
        WHERE symbol = ? AND record_date >= ?
        ORDER BY record_date ASC 
        LIMIT 1
      `, [symbol, oneYearAgoStr]);

      // 获取3年前的价格（小于等于目标日期的最近价格）
      const [threeYearsPriceRow] = await pool.execute(`
        SELECT price FROM fund_prices 
        WHERE symbol = ? AND record_date >= ?
        ORDER BY record_date ASC 
        LIMIT 1
      `, [symbol, threeYearsAgoStr]);

      let return_1y = 0;
      if (oneYearPriceRow.length > 0) {
        const oneYearPrice = parseFloat(oneYearPriceRow[0].price);
        return_1y = ((currentPrice - oneYearPrice) / oneYearPrice) * 100;
      }

      let return_3y = 0;
      if (threeYearsPriceRow.length > 0) {
        const threeYearsPrice = parseFloat(threeYearsPriceRow[0].price);
        return_3y = ((currentPrice - threeYearsPrice) / threeYearsPrice) * 100;
      }

      return {
        ytd: Math.round(ytd * 100) / 100,
        return_1y: Math.round(return_1y * 100) / 100,
        return_3y: Math.round(return_3y * 100) / 100
      };
    } catch (error) {
      console.error(`Error calculating returns for ${symbol}:`, error);
      return {
        ytd: 0,
        return_1y: 0,
        return_3y: 0
      };
    }
  }

  // Search funds
  static async search(query) {
    const [rows] = await pool.execute(`
      SELECT 
        h.id,
        h.symbol,
        h.name,
        h.type,
        h.quantity,
        h.purchase_price,
        h.purchase_date,
        h.current_price,
        h.sector,
        h.notes,
        h.is_active,
        'index' as fund_type,
        0.15 as expense_ratio,
        10.0 as ytd_return,
        15.0 as return_1y,
        12.0 as volatility_3y,
        10.0 as volatility_1y,
        8.0 as volatility_6m,
        5.0 as volatility_3m,
        ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
        ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
        ROUND(h.current_price * h.quantity, 2) as current_value
      FROM holdings h
      WHERE h.type = 'fund' AND h.is_active = TRUE 
        AND (h.name LIKE ? OR h.symbol LIKE ?)
      ORDER BY h.name
    `, [`%${query}%`, `%${query}%`]);
    return rows;
  }

  // Get fund volatility data
  static async getVolatility(symbol) {
    const [rows] = await pool.execute(`
      SELECT 
        12.0 as volatility_3y,
        10.0 as volatility_1y,
        8.0 as volatility_6m,
        5.0 as volatility_3m
      FROM holdings h
      WHERE h.symbol = ? AND h.type = 'fund' AND h.is_active = TRUE
    `, [symbol]);
    return rows[0] || {
      volatility_3y: 0,
      volatility_1y: 0,
      volatility_6m: 0,
      volatility_3m: 0
    };
  }

  // Create new fund
  static async create(fundData) {
    const { symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m, quantity, purchase_price, purchase_date, current_price, notes } = fundData;
    
    // First create holding
    const [holdingResult] = await pool.execute(
      'INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [symbol, name, 'fund', quantity, purchase_price, purchase_date, current_price, sector, notes]
    );
    
    const holdingId = holdingResult.insertId;
    
    // Then create fund record
    const [fundResult] = await pool.execute(
      'INSERT INTO funds (holding_id, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [holdingId, symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m]
    );
    
    return holdingId;
  }

  // Update fund
  static async update(id, fundData) {
    const { symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m, quantity, purchase_price, purchase_date, current_price, notes } = fundData;
    
    // Update holding
    await pool.execute(
      'UPDATE holdings SET symbol = ?, name = ?, quantity = ?, purchase_price = ?, purchase_date = ?, current_price = ?, sector = ?, notes = ? WHERE id = ?',
      [symbol, name, quantity, purchase_price, purchase_date, current_price, sector, notes, id]
    );
    
    // Update fund
    const [result] = await pool.execute(
      'UPDATE funds SET symbol = ?, name = ?, fund_type = ?, sector = ?, expense_ratio = ?, ytd_return = ?, return_1y = ?, volatility_3y = ?, volatility_1y = ?, volatility_6m = ?, volatility_3m = ? WHERE holding_id = ?',
      [symbol, name, fund_type, sector, expense_ratio, ytd_return, return_1y, volatility_3y, volatility_1y, volatility_6m, volatility_3m, id]
    );
    
    return result.affectedRows > 0;
  }

  // Calculate YTD return for a specific fund
  static async calculateYtdReturn(symbol) {
    try {
      // 获取当前年份1月1日的价格
      const currentYear = new Date().getFullYear();
      const ytdStartDate = `${currentYear}-01-01`;
      
      // 获取YTD开始价格
      const [ytdStartPriceRow] = await pool.execute(`
        SELECT price FROM fund_prices 
        WHERE symbol = ? AND record_date >= ?
        ORDER BY record_date ASC 
        LIMIT 1
      `, [symbol, ytdStartDate]);

      // 获取最新价格
      const [currentPriceRow] = await pool.execute(`
        SELECT price FROM fund_prices 
        WHERE symbol = ? 
        ORDER BY record_date DESC 
        LIMIT 1
      `, [symbol]);

      if (!ytdStartPriceRow.length || !currentPriceRow.length) {
        return null;
      }

      const ytdStartPrice = parseFloat(ytdStartPriceRow[0].price);
      const currentPrice = parseFloat(currentPriceRow[0].price);
      
      // 计算YTD回报率
      const ytdReturn = (currentPrice - ytdStartPrice) / ytdStartPrice;
      return ytdReturn;
    } catch (error) {
      console.error(`Error calculating YTD return for ${symbol}:`, error);
      return null;
    }
  }

  // Generate reasonable expense ratio based on fund type
  static generateExpenseRatio(sector) {
    // 根据基金类型生成合理的费用比率范围
    const expenseRatioRanges = {
      'Large Blend': { min: 0.02, max: 0.15 },      // 指数基金通常费用较低
      'Large Growth': { min: 0.50, max: 0.80 },     // 主动管理基金费用较高
      'Foreign Large Blend': { min: 0.08, max: 0.20 }, // 国际基金费用中等
      'Intermediate Core Bond': { min: 0.10, max: 0.25 }, // 债券基金费用中等
      'Technology': { min: 0.08, max: 0.15 },       // 行业ETF费用较低
      'Real Estate': { min: 0.10, max: 0.18 },      // REIT基金费用中等
      'Health': { min: 0.08, max: 0.15 },           // 行业ETF费用较低
      'Diversified Emerging Mkts': { min: 0.12, max: 0.25 } // 新兴市场基金费用较高
    };

    const range = expenseRatioRanges[sector] || { min: 0.10, max: 0.20 };
    const expenseRatio = Math.random() * (range.max - range.min) + range.min;
    
    return Math.round(expenseRatio * 100) / 100; // 保留两位小数
  }

  // Generate 3-year return based on fund symbol
  static generate3YearReturn(symbol) {
    // 根据基金符号生成合理的3年回报率
    const fundReturns = {
      'VTSAX': 45.2,  // 大盘指数基金，3年表现较好
      'FXAIX': 42.8,  // S&P 500指数基金
      'AGTHX': 38.5,  // 成长基金，波动较大
      'VTIAX': 28.3,  // 国际基金，表现中等
      'VBMFX': 8.5,   // 债券基金，回报较低但稳定
      'VGT': 65.2,    // 科技基金，表现最好
      'VNQ': 22.1,    // 房地产基金，表现一般
      'VHT': 35.8,    // 医疗保健基金，表现良好
      'VEMAX': 18.7   // 新兴市场基金，波动较大
    };

    // 如果找到预定义的值，返回它；否则生成一个合理的随机值
    if (fundReturns[symbol]) {
      return fundReturns[symbol];
    }

    // 为未知基金生成合理的3年回报率（8%-50%之间）
    return Math.round((Math.random() * 42 + 8) * 10) / 10;
  }

  // Calculate fund returns for different periods based on fund_prices table
  static async calculateFundReturns(symbol) {
    try {
      // 获取最新价格和最新记录日期
      const [latestPriceRow] = await pool.execute(`
        SELECT price, record_date FROM fund_prices 
        WHERE symbol = ? 
        ORDER BY record_date DESC 
        LIMIT 1
      `, [symbol]);

      if (!latestPriceRow.length) {
        return {
          return_3m: 0,
          return_6m: 0,
          return_1y: 0,
          return_3y: 0
        };
      }

      const currentPrice = parseFloat(latestPriceRow[0].price);
      const latestRecordDate = new Date(latestPriceRow[0].record_date); // 使用数据库中的最新日期作为参考

      // 计算3个月前的日期（相对于数据库中的最新日期）
      const threeMonthsAgo = new Date(latestRecordDate);
      threeMonthsAgo.setMonth(latestRecordDate.getMonth() - 3);
      const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];

      // 计算6个月前的日期
      const sixMonthsAgo = new Date(latestRecordDate);
      sixMonthsAgo.setMonth(latestRecordDate.getMonth() - 6);
      const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0];

      // 计算1年前的日期
      const oneYearAgo = new Date(latestRecordDate);
      oneYearAgo.setFullYear(latestRecordDate.getFullYear() - 1);
      const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

      // 计算3年前的日期
      const threeYearsAgo = new Date(latestRecordDate);
      threeYearsAgo.setFullYear(latestRecordDate.getFullYear() - 3);
      const threeYearsAgoStr = threeYearsAgo.toISOString().split('T')[0];

        // 获取3个月前的价格（小于等于目标日期的最近价格）
       const [threeMonthsPriceRow] = await pool.execute(`
         SELECT price FROM fund_prices 
         WHERE symbol = ? AND record_date >= ?
         ORDER BY record_date ASC 
         limit 1
       `, [symbol, threeMonthsAgoStr]);

       // 获取6个月前的价格（小于等于目标日期的最近价格）
       const [sixMonthsPriceRow] = await pool.execute(`
         SELECT price FROM fund_prices 
         WHERE symbol = ? AND record_date >= ?
         ORDER BY record_date ASC 
         limit 1
       `, [symbol, sixMonthsAgoStr]);

       // 获取1年前的价格（小于等于目标日期的最近价格）
       const [oneYearPriceRow] = await pool.execute(`
         SELECT price FROM fund_prices 
         WHERE symbol = ? AND record_date >= ?
         ORDER BY record_date ASC 
         limit 1
       `, [symbol, oneYearAgoStr]);

       // 获取3年前的价格（小于等于目标日期的最近价格）
       const [threeYearsPriceRow] = await pool.execute(`
         SELECT price FROM fund_prices 
         WHERE symbol = ? AND record_date >= ?
         ORDER BY record_date ASC 
         limit 1
       `, [symbol, threeYearsAgoStr]);
        // console.log(currentPrice);
        // console.log(threeYearsPriceRow[0].price);
      // 计算各期收益率
      let return_3m = 0;
      let return_6m = 0;
      let return_1y = 0;
      let return_3y = 0;

      if (threeMonthsPriceRow.length > 0) {
        const threeMonthsPrice = parseFloat(threeMonthsPriceRow[0].price);
        return_3m = ((currentPrice - threeMonthsPrice) / threeMonthsPrice) * 100;
      }

      if (sixMonthsPriceRow.length > 0) {
        const sixMonthsPrice = parseFloat(sixMonthsPriceRow[0].price);
        return_6m = ((currentPrice - sixMonthsPrice) / sixMonthsPrice) * 100;
      }

      if (oneYearPriceRow.length > 0) {
        const oneYearPrice = parseFloat(oneYearPriceRow[0].price);
        return_1y = ((currentPrice - oneYearPrice) / oneYearPrice) * 100;
      }

      if (threeYearsPriceRow.length > 0) {
        const threeYearsPrice = parseFloat(threeYearsPriceRow[0].price);
        return_3y = ((currentPrice - threeYearsPrice) / threeYearsPrice) * 100;
      }

      return {
        return_3m: Math.round(return_3m * 100) / 100,
        return_6m: Math.round(return_6m * 100) / 100,
        return_1y: Math.round(return_1y * 100) / 100,
        return_3y: Math.round(return_3y * 100) / 100
             };
     } catch (error) {
       console.error(`Error calculating fund returns for ${symbol}:`, error);
       return {
         return_3m: 0,
         return_6m: 0,
         return_1y: 0,
         return_3y: 0
       };
     }
   }

   // Calculate fund performance history for chart
   static async calculatePerformanceHistory(symbol) {
     try {
       // 获取基金的基本信息（买入价格和日期）
       const [fundInfo] = await pool.execute(`
         SELECT purchase_price, purchase_date FROM holdings 
         WHERE symbol = ? AND type = 'fund' AND is_active = TRUE
         LIMIT 1
       `, [symbol]);

       if (!fundInfo.length) {
         return {
           dates: [],
           performanceData: []
         };
       }

       const purchasePrice = parseFloat(fundInfo[0].purchase_price);
       const purchaseDate = new Date(fundInfo[0].purchase_date);

       // 获取该基金的所有价格数据，按日期排序
       const [priceData] = await pool.execute(`
         SELECT record_date, price FROM fund_prices 
         WHERE symbol = ? AND record_date >= ?
         ORDER BY record_date ASC
       `, [symbol, purchaseDate.toISOString().split('T')[0]]);

       if (!priceData.length) {
         return {
           dates: [],
           performanceData: []
         };
       }

       const dates = [];
       const performanceData = [];

       // 计算每天的收益率
       for (const record of priceData) {
         const currentPrice = parseFloat(record.price);
         const currentDate = new Date(record.record_date);
         
         // 计算从买入日期到当前日期的收益率
         const returnRate = ((currentPrice - purchasePrice) / purchasePrice) * 100;
         
         dates.push(currentDate.toLocaleDateString('en-US', { 
           year: 'numeric', 
           month: '2-digit', 
           day: '2-digit' 
         }));
         performanceData.push(returnRate.toFixed(2));
       }

       return {
         dates,
         performanceData
       };
     } catch (error) {
       console.error(`Error calculating performance history for ${symbol}:`, error);
       return {
         dates: [],
         performanceData: []
       };
     }
   }
}

module.exports = Fund; 