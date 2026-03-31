const { Sequelize } = require('sequelize');
const logger = require('../utils/logger');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'ecoalerta',
  process.env.DB_USER || 'ecoalerta',
  process.env.DB_PASS || 'ecoalerta123',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    logging: (msg) => logger.debug(msg),
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    define: { underscored: true, timestamps: true, createdAt: 'criado_em', updatedAt: 'atualizado_em' }
  }
);

module.exports = sequelize;
