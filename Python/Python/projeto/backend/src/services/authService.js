const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, perfil: user.perfil },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

async function register({ nome, email, senha }) {
  const existing = await Usuario.findOne({ where: { email } });
  if (existing) {
    const err = new Error('E-mail já cadastrado.');
    err.status = 409; err.code = 'CONFLICT';
    throw err;
  }
  const user = await Usuario.create({ nome, email, senha_hash: senha });
  return { user: user.toSafeJSON(), token: generateToken(user) };
}

async function login({ email, senha }) {
  const user = await Usuario.findOne({ where: { email } });
  if (!user || !(await user.checkPassword(senha))) {
    const err = new Error('Credenciais inválidas.');
    err.status = 401; err.code = 'UNAUTHORIZED';
    throw err;
  }
  if (!user.ativo) {
    const err = new Error('Conta inativa.');
    err.status = 401; err.code = 'UNAUTHORIZED';
    throw err;
  }
  return { token: generateToken(user), expiresIn: 86400, user: user.toSafeJSON() };
}

module.exports = { register, login, generateToken };
