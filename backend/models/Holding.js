const { pool } = require('../config/database');

class Holding {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT h.*, 
             ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
             ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
             ROUND(h.current_price * h.quantity, 2) as current_value
      FROM holdings h 
      WHERE h.is_active = TRUE
      ORDER BY h.created_at DESC
    `);
    return rows;
  }

  static async getById(id) {
    const [rows] = await pool.execute(`
      SELECT h.*, 
             ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
             ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
             ROUND(h.current_price * h.quantity, 2) as current_value
      FROM holdings h 
      WHERE h.id = ?
    `, [id]);
    return rows[0];
  }

  static async create(holding) {
    const { symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes } = holding;
    
    // 确保所有必需字段都有值，避免 undefined
    const insertData = {
      symbol: symbol || '',
      name: name || '',
      type: type || 'fund',
      quantity: quantity || 0,
      purchase_price: purchase_price || 0,
      purchase_date: purchase_date || new Date().toISOString().split('T')[0],
      current_price: current_price || purchase_price || 0,
      sector: sector || 'Unknown',
      notes: notes || ''
    };
    
    const [result] = await pool.execute(
      'INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        insertData.symbol,
        insertData.name,
        insertData.type,
        insertData.quantity,
        insertData.purchase_price,
        insertData.purchase_date,
        insertData.current_price,
        insertData.sector,
        insertData.notes
      ]
    );
    return result.insertId;
  }

  static async update(id, holding) {
    // 过滤掉 undefined 值，避免数据库错误
    const updateData = {};
    Object.keys(holding).forEach(key => {
      if (holding[key] !== undefined) {
        updateData[key] = holding[key];
      }
    });
    
    // 构建动态 SQL 查询
    const fields = Object.keys(updateData);
    const values = Object.values(updateData);
    
    if (fields.length === 0) {
      return false; // 没有有效字段更新
    }
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE holdings SET ${setClause} WHERE id = ?`;
    
    const [result] = await pool.execute(sql, [...values, id]);
    return result.affectedRows > 0;
  }

  static async updateCurrentPrice(symbol, price) {
    const [result] = await pool.execute(
      'UPDATE holdings SET current_price = ? WHERE symbol = ?',
      [price, symbol]
    );
    return result.affectedRows;
  }

  static async delete(id) {
    const [result] = await pool.execute('UPDATE holdings SET is_active = FALSE WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getPortfolioSummary() {
    const [summaryRows] = await pool.execute(`
      SELECT 
        COUNT(*) as total_holdings,
        ROUND(SUM(current_price * quantity), 2) as total_value,
        ROUND(SUM((current_price - purchase_price) * quantity), 2) as total_gain,
        ROUND(AVG(((current_price - purchase_price) / purchase_price) * 100), 2) as avg_gain_percent
      FROM holdings
      WHERE is_active = TRUE
    `);

    const [topPerformers] = await pool.execute(`
      SELECT 
        symbol, 
        name,
        current_price,
        ROUND(((current_price - purchase_price) / purchase_price) * 100, 2) as gain_percent
      FROM holdings 
      WHERE is_active = TRUE
      ORDER BY ((current_price - purchase_price) / purchase_price) DESC 
      LIMIT 3
    `);

    return {
      summary: summaryRows[0],
      topPerformers
    };
  }

  static async getHistoricalData() {
    const [rows] = await pool.execute(`
      SELECT date, total_value, daily_change 
      FROM portfolio_history 
      ORDER BY date DESC 
      LIMIT 7
    `);
    return rows.reverse();
  }

  // Get asset allocation analysis
  static async getAllocationAnalysis() {
    const [rows] = await pool.execute(`
      SELECT 
        type,
        COUNT(*) as count,
        ROUND(SUM(quantity * current_price), 2) as total_value,
        ROUND(SUM(quantity * current_price) / (SELECT SUM(quantity * current_price) FROM holdings WHERE is_active = TRUE) * 100, 2) as percentage
      FROM holdings 
      WHERE is_active = TRUE
      GROUP BY type
      ORDER BY total_value DESC
    `);
    return rows;
  }

  // Get performance analysis
  static async getPerformanceAnalysis() {
    const [rows] = await pool.execute(`
      SELECT 
        ROUND(SUM(quantity * current_price), 2) as current_value,
        ROUND(SUM(quantity * purchase_price), 2) as total_cost,
        ROUND(SUM(quantity * current_price) - SUM(quantity * purchase_price), 2) as total_gain_loss,
        ROUND((SUM(quantity * current_price) - SUM(quantity * purchase_price)) / SUM(quantity * purchase_price) * 100, 2) as gain_loss_percent
      FROM holdings 
      WHERE is_active = TRUE
    `);
    return rows[0];
  }

  // Get sector analysis
  static async getSectorAnalysis() {
    const [rows] = await pool.execute(`
      SELECT 
        sector,
        COUNT(*) as count,
        ROUND(SUM(quantity * current_price), 2) as total_value,
        ROUND(SUM(quantity * current_price) / (SELECT SUM(quantity * current_price) FROM holdings WHERE sector IS NOT NULL AND is_active = TRUE) * 100, 2) as percentage
      FROM holdings 
      WHERE sector IS NOT NULL AND is_active = TRUE
      GROUP BY sector
      ORDER BY total_value DESC
    `);
    return rows;
  }

  // Get detailed historical analysis
  static async getDetailedHistoryAnalysis() {
    const [rows] = await pool.execute(`
      SELECT 
        date,
        total_value,
        daily_change,
        total_cost,
        total_gain_loss,
        gain_loss_percent,
        ROUND(daily_change / (total_value - daily_change) * 100, 2) as daily_change_percent
      FROM portfolio_history 
      ORDER BY date DESC 
      LIMIT 30
    `);
    return rows.reverse();
  }

  // Get all funds (holdings with type 'fund')
  static async getFunds() {
    const [rows] = await pool.execute(`
      SELECT h.*, 
             ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
             ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
             ROUND(h.current_price * h.quantity, 2) as current_value,
             ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as ytd,
             ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as return_1y
      FROM holdings h 
      WHERE h.type = 'fund' AND h.is_active = TRUE
      ORDER BY h.created_at DESC
    `);
    return rows;
  }

  // Get fund categories analysis
  static async getFundCategories() {
    const [rows] = await pool.execute(`
      SELECT 
        sector as type,
        COUNT(*) as count,
        ROUND(SUM(quantity * current_price), 2) as value,
        ROUND(AVG(((current_price - purchase_price) / purchase_price) * 100), 2) as ytd,
        ROUND(SUM(quantity * current_price) / (SELECT SUM(quantity * current_price) FROM holdings WHERE type = 'fund' AND is_active = TRUE) * 100, 2) as percentage
      FROM holdings 
      WHERE type = 'fund' AND is_active = TRUE
      GROUP BY sector
      ORDER BY value DESC
    `);
    return rows;
  }

  // Get fund performance data
  static async getFundPerformance() {
    const [rows] = await pool.execute(`
      SELECT 
        symbol,
        name,
        type,
        sector,
        quantity,
        current_price,
        purchase_price,
        ROUND(quantity * current_price, 2) as current_value,
        ROUND(((current_price - purchase_price) / purchase_price) * 100, 2) as ytd,
        ROUND(((current_price - purchase_price) / purchase_price) * 100, 2) as return_1y,
        ROUND(0.5, 2) as expense_ratio
      FROM holdings 
      WHERE type = 'fund' AND is_active = TRUE
      ORDER BY current_value DESC
    `);
    return rows;
  }

  // Get fund volatility data (simulated)
  static async getFundVolatility(symbol) {
    // This would typically come from external API data
    // For now, returning simulated data
    return {
      symbol,
      volatility_3y: Math.random() * 20 + 5,
      volatility_1y: Math.random() * 15 + 5,
      volatility_6m: Math.random() * 10 + 3,
      volatility_3m: Math.random() * 8 + 2
    };
  }

  // Search funds
  static async searchFunds(query) {
    const [rows] = await pool.execute(`
      SELECT h.*, 
             ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
             ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
             ROUND(h.current_price * h.quantity, 2) as current_value,
             ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as ytd,
             ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as return_1y
      FROM holdings h 
      WHERE h.type = 'fund' AND h.is_active = TRUE 
        AND (h.name LIKE ? OR h.symbol LIKE ?)
      ORDER BY h.name
    `, [`%${query}%`, `%${query}%`]);
    return rows;
  }

  // Get holding by symbol
  static async getBySymbol(symbol) {
    const [rows] = await pool.execute(`
      SELECT h.*, 
             ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
             ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
             ROUND(h.current_price * h.quantity, 2) as current_value
      FROM holdings h 
      WHERE h.symbol = ? AND h.is_active = TRUE
    `, [symbol]);
    return rows[0];
  }
}

module.exports = Holding;