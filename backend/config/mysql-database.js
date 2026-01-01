const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  charset: 'utf8mb4'
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ MySQL connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('✗ MySQL connection failed:', error.message);
    return false;
  }
};

// Execute query with error handling
const query = async (sql, params = []) => {
  try {
    const [results] = await pool.query(sql, params);
    return results;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

// Graceful shutdown
const closePool = async () => {
  try {
    await pool.end();
    console.log('MySQL pool closed');
  } catch (error) {
    console.error('Error closing MySQL pool:', error);
  }
};

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  closePool
};
