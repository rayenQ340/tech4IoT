// Add this at the top of dbConfig.js
const { Sequelize } = require('sequelize');
require('dotenv').config({ path: __dirname + '/../.env' });

console.log('Database Config:', {
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS || '[empty]',
  DB_HOST: process.env.DB_HOST
});

const sequelize = new Sequelize(
  process.env.DB_NAME || 'XAMPP MySQL',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '', // Allow empty password
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: process.env.DB_LOGGING === 'true' ? console.log : false,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX) || 5,
      min: parseInt(process.env.DB_POOL_MIN) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE) || 10000
    }
  }
);

module.exports = sequelize;