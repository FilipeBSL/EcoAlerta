require('dotenv').config();
const app = require('./app');
const { sequelize } = require('./models');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Conexão com banco de dados estabelecida.');
    await sequelize.sync({ force: false });
    logger.info('Modelos sincronizados com o banco de dados.');

    app.listen(PORT, () => {
      logger.info(`Servidor rodando na porta ${PORT} [${process.env.NODE_ENV}]`);
    });
  } catch (err) {
    logger.error('Falha ao iniciar o servidor:', err);
    process.exit(1);
  }
}

start();
