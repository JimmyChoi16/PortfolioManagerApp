const db = require('../config/database');

exports.createPortfolio = async ({ user_name, name, description, holdings }) => {
  // Use db.pool.getConnection() to get a connection from the pool
  const conn = await db.pool.getConnection();
  try {
    await conn.beginTransaction();
    // Insert into portfolio
    const [portfolioResult] = await conn.query(
      'INSERT INTO portfolio (user_name, name, description) VALUES (?, ?, ?)',
      [user_name, name, description]
    );
    const portfolio_id = portfolioResult.insertId;
    // Insert into portfolio_holding
    for (const h of holdings) {
      await conn.query(
        'INSERT INTO portfolio_holding (portfolio_id, holding_id, allocation_percent) VALUES (?, ?, ?)',
        [portfolio_id, h.holding_id, h.allocation_percent]
      );
    }
    await conn.commit();
    return { portfolio_id };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}; 