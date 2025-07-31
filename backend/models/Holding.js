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

  // Get real-time performance metrics based on current holdings
  static async getRealTimePerformanceMetrics() {
    // Get current holdings data
    const [holdings] = await pool.execute(`
      SELECT 
        quantity,
        purchase_price,
        current_price,
        purchase_date
      FROM holdings 
      WHERE is_active = TRUE
    `);

    if (holdings.length === 0) {
      return {
        cagr: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        totalValue: 0,
        totalCost: 0,
        totalGainLoss: 0,
        gainLossPercent: 0
      };
    }

    // Calculate current total value and cost
    let totalValue = 0;
    let totalCost = 0;
    const purchaseDates = [];

    holdings.forEach(holding => {
      const quantity = parseFloat(holding.quantity);
      const purchasePrice = parseFloat(holding.purchase_price);
      const currentPrice = parseFloat(holding.current_price);
      
      totalValue += quantity * currentPrice;
      totalCost += quantity * purchasePrice;
      purchaseDates.push(new Date(holding.purchase_date));
    });

    const totalGainLoss = totalValue - totalCost;
    const gainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    // Calculate CAGR (Compound Annual Growth Rate)
    const earliestDate = new Date(Math.min(...purchaseDates));
    const currentDate = new Date();
    const years = (currentDate - earliestDate) / (365 * 24 * 60 * 60 * 1000);
    const cagr = years > 0 ? Math.pow(totalValue / totalCost, 1 / years) - 1 : 0;

    // Calculate Sharpe Ratio (simplified version)
    // For now, we'll use a simplified calculation based on the gain/loss percentage
    const riskFreeRate = 0.02; // 2% annual risk-free rate
    const volatility = Math.abs(gainLossPercent) / 100; // Simplified volatility
    const sharpeRatio = volatility > 0 ? (gainLossPercent / 100 - riskFreeRate) / volatility : 0;

    // Calculate Max Drawdown (simplified version)
    // For now, we'll use the current drawdown from peak
    const peakValue = totalCost * 1.5; // Assume peak was 50% above cost
    const currentDrawdown = peakValue > 0 ? (peakValue - totalValue) / peakValue : 0;
    const maxDrawdown = Math.max(currentDrawdown, 0);

    return {
      cagr: cagr * 100, // Convert to percentage
      sharpeRatio,
      maxDrawdown: maxDrawdown * 100, // Convert to percentage
      totalValue,
      totalCost,
      totalGainLoss,
      gainLossPercent
    };
  }

  // Update portfolio history with current data
  static async updatePortfolioHistory() {
    const today = new Date().toISOString().split('T')[0];
    
    // Get current portfolio value
    const [currentValue] = await pool.execute(`
      SELECT 
        ROUND(SUM(quantity * current_price), 2) as total_value,
        ROUND(SUM(quantity * purchase_price), 2) as total_cost
      FROM holdings 
      WHERE is_active = TRUE
    `);

    if (currentValue.length === 0 || !currentValue[0].total_value) {
      return;
    }

    const totalValue = parseFloat(currentValue[0].total_value);
    const totalCost = parseFloat(currentValue[0].total_cost);
    const totalGainLoss = totalValue - totalCost;
    const gainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    // Get yesterday's value to calculate daily change
    const [yesterdayData] = await pool.execute(`
      SELECT total_value 
      FROM portfolio_history 
      WHERE date = DATE_SUB(?, INTERVAL 1 DAY)
    `, [today]);

    const yesterdayValue = yesterdayData.length > 0 ? parseFloat(yesterdayData[0].total_value) : totalValue;
    const dailyChange = totalValue - yesterdayValue;

    // Insert or update today's record
    await pool.execute(`
      INSERT INTO portfolio_history (date, total_value, daily_change, total_cost, total_gain_loss, gain_loss_percent)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        total_value = VALUES(total_value),
        daily_change = VALUES(daily_change),
        total_cost = VALUES(total_cost),
        total_gain_loss = VALUES(total_gain_loss),
        gain_loss_percent = VALUES(gain_loss_percent)
    `, [today, totalValue, dailyChange, totalCost, totalGainLoss, gainLossPercent]);
  }
}

module.exports = Holding;