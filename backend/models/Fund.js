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
        COALESCE(f.fund_type, 'index') as fund_type,
        COALESCE(f.expense_ratio, 0.15) as expense_ratio,
        COALESCE(f.ytd_return, 10.0) as ytd_return,
        COALESCE(f.return_1y, 15.0) as return_1y,
        COALESCE(f.volatility_3y, 12.0) as volatility_3y,
        COALESCE(f.volatility_1y, 10.0) as volatility_1y,
        COALESCE(f.volatility_6m, 8.0) as volatility_6m,
        COALESCE(f.volatility_3m, 5.0) as volatility_3m,
        ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
        ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
        ROUND(h.current_price * h.quantity, 2) as current_value
      FROM holdings h
      LEFT JOIN funds f ON h.id = f.holding_id
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
        f.fund_type,
        f.expense_ratio,
        f.ytd_return,
        f.return_1y,
        f.volatility_3y,
        f.volatility_1y,
        f.volatility_6m,
        f.volatility_3m,
        ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
        ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
        ROUND(h.current_price * h.quantity, 2) as current_value
      FROM holdings h
      LEFT JOIN funds f ON h.id = f.holding_id
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
        ROUND(AVG(COALESCE(f.ytd_return, 10.0)), 2) as ytd,
        ROUND(SUM(h.quantity * h.current_price) / (SELECT SUM(quantity * current_price) FROM holdings WHERE type = 'fund' AND is_active = TRUE) * 100, 2) as percentage
      FROM holdings h
      LEFT JOIN funds f ON h.id = f.holding_id
      WHERE h.type = 'fund' AND h.is_active = TRUE
      GROUP BY h.sector
      ORDER BY value DESC
    `);
    return rows;
  }

  // Get fund performance data
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
        f.ytd_return as ytd,
        f.return_1y,
        f.expense_ratio
      FROM holdings h
      LEFT JOIN funds f ON h.id = f.holding_id
      WHERE h.type = 'fund' AND h.is_active = TRUE
      ORDER BY current_value DESC
    `);
    return rows;
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
        f.fund_type,
        f.expense_ratio,
        f.ytd_return,
        f.return_1y,
        f.volatility_3y,
        f.volatility_1y,
        f.volatility_6m,
        f.volatility_3m,
        ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
        ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
        ROUND(h.current_price * h.quantity, 2) as current_value
      FROM holdings h
      LEFT JOIN funds f ON h.id = f.holding_id
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
        f.volatility_3y,
        f.volatility_1y,
        f.volatility_6m,
        f.volatility_3m
      FROM holdings h
      LEFT JOIN funds f ON h.id = f.holding_id
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