const { pool } = require('../config/database');

// Calculate current portfolio total value
async function calculateCurrentPortfolioValue() {
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

// Generate realistic portfolio history data
async function generatePortfolioHistory() {
  const { totalValue, totalCost } = await calculateCurrentPortfolioValue();
  
  console.log(`Current portfolio value: $${totalValue.toLocaleString()}`);
  console.log(`Total cost: $${totalCost.toLocaleString()}`);
  
  // Generate 18 months of daily data (from 2024-01-01 to 2025-07-31)
  const historyData = [];
  const startDate = new Date('2024-01-01');
  const endDate = new Date('2025-07-31');
  
  // Start with a base value (80% of current value to show growth)
  let baseValue = totalValue * 0.8;
  let previousValue = baseValue;
  
  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    // Skip weekends (Saturday = 6, Sunday = 0)
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }
    
    // Generate realistic daily change (-3% to +5% range)
    const dailyChangePercent = (Math.random() - 0.5) * 0.08; // -4% to +4%
    const dailyChange = previousValue * dailyChangePercent;
    const currentValue = previousValue + dailyChange;
    
    // Ensure value doesn't go below 60% of current value
    if (currentValue < totalValue * 0.6) {
      continue;
    }
    
    const totalGainLoss = currentValue - totalCost;
    const gainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    
    historyData.push({
      date: date.toISOString().split('T')[0],
      total_value: Math.round(currentValue * 100) / 100,
      daily_change: Math.round(dailyChange * 100) / 100,
      total_cost: totalCost,
      total_gain_loss: Math.round(totalGainLoss * 100) / 100,
      gain_loss_percent: Math.round(gainLossPercent * 100) / 100
    });
    
    previousValue = currentValue;
  }
  
  return historyData;
}

// Insert portfolio history data
async function insertPortfolioHistory(historyData) {
  console.log(`Inserting ${historyData.length} days of portfolio history...`);
  
  // Clear existing data first
  await pool.execute('DELETE FROM portfolio_history');
  
  // Insert new data
  for (const record of historyData) {
    await pool.execute(`
      INSERT INTO portfolio_history (date, total_value, daily_change, total_cost, total_gain_loss, gain_loss_percent)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      record.date,
      record.total_value,
      record.daily_change,
      record.total_cost,
      record.total_gain_loss,
      record.gain_loss_percent
    ]);
  }
  
  console.log('Portfolio history data inserted successfully!');
}

// Main execution
async function main() {
  try {
    const historyData = await generatePortfolioHistory();
    await insertPortfolioHistory(historyData);
    
    // Show sample of inserted data
    const [sampleData] = await pool.execute(`
      SELECT * FROM portfolio_history 
      ORDER BY date DESC 
      LIMIT 10
    `);
    
    console.log('\nSample of inserted data:');
    sampleData.forEach(record => {
      console.log(`${record.date}: $${record.total_value.toLocaleString()} (${record.daily_change >= 0 ? '+' : ''}${parseFloat(record.daily_change).toFixed(2)})`);
    });
    
  } catch (error) {
    console.error('Error generating portfolio history:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
main(); 