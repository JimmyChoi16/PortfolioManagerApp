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
    const [result] = await pool.execute(
      'INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [symbol, name, type, quantity, purchase_price, purchase_date, current_price || purchase_price, sector, notes]
    );
    return result.insertId;
  }

  static async update(id, holding) {
    const { symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes } = holding;
    const [result] = await pool.execute(
      'UPDATE holdings SET symbol = ?, name = ?, type = ?, quantity = ?, purchase_price = ?, purchase_date = ?, current_price = ?, sector = ?, notes = ? WHERE id = ?',
      [symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes, id]
    );
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
}

module.exports = Holding;