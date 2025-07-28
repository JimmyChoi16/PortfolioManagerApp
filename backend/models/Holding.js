const { pool } = require('../config/database');

class Holding {
  static async getAll() {
    const [rows] = await pool.execute(`
      SELECT h.*, 
             ROUND((h.current_price - h.purchase_price) * h.quantity, 2) as unrealized_gain,
             ROUND(((h.current_price - h.purchase_price) / h.purchase_price) * 100, 2) as gain_percent,
             ROUND(h.current_price * h.quantity, 2) as current_value
      FROM holdings h 
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
    const { symbol, name, type, quantity, purchase_price, purchase_date, current_price } = holding;
    const [result] = await pool.execute(
      'INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [symbol, name, type, quantity, purchase_price, purchase_date, current_price || purchase_price]
    );
    return result.insertId;
  }

  static async update(id, holding) {
    const { symbol, name, type, quantity, purchase_price, purchase_date, current_price } = holding;
    const [result] = await pool.execute(
      'UPDATE holdings SET symbol = ?, name = ?, type = ?, quantity = ?, purchase_price = ?, purchase_date = ?, current_price = ? WHERE id = ?',
      [symbol, name, type, quantity, purchase_price, purchase_date, current_price, id]
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
    const [result] = await pool.execute('DELETE FROM holdings WHERE id = ?', [id]);
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
    `);

    const [topPerformers] = await pool.execute(`
      SELECT 
        symbol, 
        name,
        current_price,
        ROUND(((current_price - purchase_price) / purchase_price) * 100, 2) as gain_percent
      FROM holdings 
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
}

module.exports = Holding;