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
        ROUND(AVG(10.0), 2) as ytd,
        ROUND(AVG(0.15), 2) as expense_ratio,
        ROUND(SUM(h.quantity * h.current_price) / (SELECT SUM(quantity * current_price) FROM holdings WHERE type = 'fund' AND is_active = TRUE) * 100, 2) as percentage
      FROM holdings h
      WHERE h.type = 'fund' AND h.is_active = TRUE
      GROUP BY h.sector
      ORDER BY value DESC
    `);
    
    // 添加默认值确保所有字段都存在
    return rows.map(row => ({
      type: row.type || 'Unknown',
      count: row.count || 0,
      value: row.value || 0,
      ytd: row.ytd || 0,
      expense_ratio: row.expense_ratio || 0,
      percentage: row.percentage || 0
    }));
  }

  // Get fund performance data with historical returns
  static async getPerformance() {
    const [rows] = await pool.execute(`
      SELECT 
        h.symbol,
        h.name,
        h.sector,
        h.quantity,
        h.current_price,
        h.purchase_price,
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
      // 获取当前价格
      const [currentPriceRow] = await pool.execute(`
        SELECT price FROM fund_prices 
        WHERE symbol = ? 
        ORDER BY record_date DESC 
        LIMIT 1
      `, [symbol]);

      if (!currentPriceRow.length) {
        return {
          ytd: 0,
          return_1y: 0,
          return_3y: 0
        };
      }

      const currentPrice = parseFloat(currentPriceRow[0].price);

      // 计算YTD收益率（从今年1月1日开始）
      const [ytdPriceRow] = await pool.execute(`
        SELECT price FROM fund_prices 
        WHERE symbol = ? AND record_date >= DATE_FORMAT(NOW(), '%Y-01-01')
        ORDER BY record_date ASC 
        LIMIT 1
      `, [symbol]);

      let ytd = 0;
      if (ytdPriceRow.length > 0) {
        const ytdPrice = parseFloat(ytdPriceRow[0].price);
        ytd = ((currentPrice - ytdPrice) / ytdPrice) * 100;
      }

      // 计算1年收益率
      const [oneYearPriceRow] = await pool.execute(`
        SELECT price FROM fund_prices 
        WHERE symbol = ? AND record_date >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
        ORDER BY record_date ASC 
        LIMIT 1
      `, [symbol]);

      let return_1y = 0;
      if (oneYearPriceRow.length > 0) {
        const oneYearPrice = parseFloat(oneYearPriceRow[0].price);
        return_1y = ((currentPrice - oneYearPrice) / oneYearPrice) * 100;
      }

      // 计算3年收益率
      const [threeYearPriceRow] = await pool.execute(`
        SELECT price FROM fund_prices 
        WHERE symbol = ? AND record_date >= DATE_SUB(NOW(), INTERVAL 3 YEAR)
        ORDER BY record_date ASC 
        LIMIT 1
      `, [symbol]);

      let return_3y = 0;
      if (threeYearPriceRow.length > 0) {
        const threeYearPrice = parseFloat(threeYearPriceRow[0].price);
        return_3y = ((currentPrice - threeYearPrice) / threeYearPrice) * 100;
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
}

module.exports = Fund; 