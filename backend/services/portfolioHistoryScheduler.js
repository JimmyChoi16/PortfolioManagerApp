const cron = require('node-cron');
const { pool } = require('../config/database');

class PortfolioHistoryScheduler {
  constructor() {
    this.isRunning = false;
  }

  // Calculate current portfolio value
  async calculateCurrentPortfolioValue() {
    const [rows] = await pool.execute(`
      SELECT 
        ROUND(SUM(quantity * current_price), 2) as total_value,
        ROUND(SUM(quantity * purchase_price), 2) as total_cost
      FROM holdings 
      WHERE is_active = TRUE
    `);
    
    if (rows.length > 0) {
      return {
        totalValue: parseFloat(rows[0].total_value),
        totalCost: parseFloat(rows[0].total_cost)
      };
    }
    return { totalValue: 0, totalCost: 0 };
  }

  // Update portfolio history for today
  async updatePortfolioHistory() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { totalValue, totalCost } = await this.calculateCurrentPortfolioValue();
      
      if (totalValue === 0) {
        console.log('No active holdings found, skipping portfolio history update');
        return;
      }

      // Get yesterday's value to calculate daily change
      const [yesterdayData] = await pool.execute(`
        SELECT total_value 
        FROM portfolio_history 
        WHERE date = DATE_SUB(?, INTERVAL 1 DAY)
        ORDER BY date DESC
        LIMIT 1
      `, [today]);

      const yesterdayValue = yesterdayData.length > 0 ? parseFloat(yesterdayData[0].total_value) : totalValue;
      const dailyChange = totalValue - yesterdayValue;
      const totalGainLoss = totalValue - totalCost;
      const gainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

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

      console.log(`Portfolio history updated for ${today}: $${totalValue.toLocaleString()} (${dailyChange >= 0 ? '+' : ''}${dailyChange.toFixed(2)})`);
      
    } catch (error) {
      console.error('Error updating portfolio history:', error);
    }
  }

  // Start the scheduler
  start() {
    if (this.isRunning) {
      console.log('Portfolio history scheduler is already running');
      return;
    }

    console.log('Starting portfolio history scheduler...');

    // Schedule daily update at 6:00 PM (18:00) - after market close
    // Cron format: minute hour day month day-of-week
    // '0 18 * * 1-5' means every weekday at 6:00 PM
    cron.schedule('0 18 * * 1-5', async () => {
      console.log('Running scheduled portfolio history update...');
      await this.updatePortfolioHistory();
    }, {
      timezone: "Asia/Shanghai" // Use China timezone
    });

    // Also run immediately on startup
    this.updatePortfolioHistory();

    this.isRunning = true;
    console.log('Portfolio history scheduler started successfully');
  }

  // Stop the scheduler
  stop() {
    if (!this.isRunning) {
      console.log('Portfolio history scheduler is not running');
      return;
    }

    cron.getTasks().forEach(task => task.stop());
    this.isRunning = false;
    console.log('Portfolio history scheduler stopped');
  }

  // Manual update method
  async manualUpdate() {
    console.log('Running manual portfolio history update...');
    await this.updatePortfolioHistory();
  }
}

module.exports = new PortfolioHistoryScheduler(); 