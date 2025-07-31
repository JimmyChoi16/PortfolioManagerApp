const mysql = require('mysql2');
const path = require('path');

// Try to load .env file if it exists, but don't fail if it doesn't
try {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
} catch (error) {
  console.log('No .env file found, using default configuration');
}

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

// Test the connection
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log('Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
};

module.exports = {
  pool: promisePool,
  testConnection
};