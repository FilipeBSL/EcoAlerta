const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

const tokenBlacklist = new Set();

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token não fornecido.' } });
  }

  const token = authHeader.split(' ')[1];

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Token inválido.' } });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await Usuario.findByPk(decoded.id);
    if (!user || !user.ativo) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Usuário não encontrado ou inativo.' } });
    }
    req.user = user;
    req.token = token;
    next();
  } catch (err) {
    const code = err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'UNAUTHORIZED';
    return res.status(401).json({ error: { code, message: 'Token inválido ou expirado.' } });
  }
}

function addToBlacklist(token) {
  tokenBlacklist.add(token);
}

module.exports = { authMiddleware, addToBlacklist };
