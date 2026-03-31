const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  logger.error(err.message, { stack: err.stack, path: req.path });

  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Dados inválidos.',
        details: err.errors.map(e => ({ field: e.path, message: e.message }))
      }
    });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'Registro já existe.' }
    });
  }

  if (err.status) {
    return res.status(err.status).json({ error: { code: err.code || 'ERROR', message: err.message } });
  }

  return res.status(500).json({
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Erro interno do servidor.' }
  });
}

module.exports = errorHandler;
