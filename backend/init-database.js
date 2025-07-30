const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const promisePool = pool.promise();

const initDatabase = async () => {
  try {
    console.log('Starting database initialization...');
    
    // Read schema file
    const schemaPath = path.join(__dirname, 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    const connection = await promisePool.getConnection();
    
    console.log('Executing schema statements...');
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement);
          console.log('✓ Executed:', statement.substring(0, 50) + '...');
        } catch (error) {
          console.log('⚠ Skipped (likely already exists):', statement.substring(0, 50) + '...');
        }
      }
    }
    
    // Insert bond data specifically
    console.log('Inserting bond data...');
    
    const bondData = [
      {
        symbol: 'UST10Y',
        name: 'U.S. Treasury 10-Year',
        type: 'bond',
        quantity: 50,
        purchase_price: 100.00,
        purchase_date: '2023-05-15',
        current_price: 98.50,
        sector: 'Government',
        notes: 'Government bond with 4.25% coupon'
      },
      {
        symbol: 'AAPL5Y',
        name: 'Apple Inc. 5-Year',
        type: 'bond',
        quantity: 25,
        purchase_price: 100.00,
        purchase_date: '2023-06-10',
        current_price: 101.20,
        sector: 'Technology',
        notes: 'Corporate bond with 3.85% coupon'
      },
      {
        symbol: 'CAMUNI7',
        name: 'California Muni 7-Year',
        type: 'bond',
        quantity: 30,
        purchase_price: 100.00,
        purchase_date: '2023-07-20',
        current_price: 99.80,
        sector: 'Municipal',
        notes: 'Municipal bond with 3.45% coupon'
      },
      {
        symbol: 'DEBUND5',
        name: 'German Bund 5-Year',
        type: 'bond',
        quantity: 20,
        purchase_price: 100.00,
        purchase_date: '2023-08-05',
        current_price: 98.90,
        sector: 'International',
        notes: 'International bond with 2.15% coupon'
      }
    ];
    
    for (const bond of bondData) {
      try {
        await connection.execute(
          `INSERT INTO holdings (symbol, name, type, quantity, purchase_price, purchase_date, current_price, sector, notes) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE 
           current_price = VALUES(current_price), 
           sector = VALUES(sector), 
           notes = VALUES(notes)`,
          [bond.symbol, bond.name, bond.type, bond.quantity, bond.purchase_price, bond.purchase_date, bond.current_price, bond.sector, bond.notes]
        );
        console.log(`✓ Inserted bond: ${bond.symbol}`);
      } catch (error) {
        console.log(`⚠ Bond ${bond.symbol} already exists or error:`, error.message);
      }
    }
    
    connection.release();
    console.log('Database initialization completed successfully!');
    
    // Verify bond data
    console.log('\nVerifying bond data...');
    const [rows] = await promisePool.execute(
      "SELECT symbol, name, type, quantity, current_price FROM holdings WHERE type = 'bond'"
    );
    
    console.log(`Found ${rows.length} bond records:`);
    rows.forEach(row => {
      console.log(`  - ${row.symbol}: ${row.name} (${row.quantity} units @ $${row.current_price})`);
    });
    
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await pool.end();
  }
};

// Run if called directly
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase }; 