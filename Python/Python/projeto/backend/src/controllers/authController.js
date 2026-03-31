const authService = require('../services/authService');
const { addToBlacklist } = require('../middlewares/auth');

async function register(req, res, next) {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'nome, email e senha são obrigatórios.' } });
    }
    const result = await authService.register({ nome, email, senha });
    return res.status(201).json({ message: 'Cadastro realizado com sucesso.', ...result });
  } catch (err) { next(err); }
}

async function login(req, res, next) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'email e senha são obrigatórios.' } });
    }
    const result = await authService.login({ email, senha });
    return res.json(result);
  } catch (err) { next(err); }
}

async function logout(req, res) {
  addToBlacklist(req.token);
  return res.json({ message: 'Logout realizado com sucesso.' });
}

async function getMe(req, res) {
  return res.json(req.user.toSafeJSON());
}

async function updateMe(req, res, next) {
  try {
    const { nome, senha_nova, senha_atual } = req.body;
    const user = req.user;

    if (senha_nova) {
      if (!senha_atual || !(await user.checkPassword(senha_atual))) {
        return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Senha atual incorreta.' } });
      }
      user.senha_hash = senha_nova;
    }
    if (nome) user.nome = nome;
    await user.save();
    return res.json({ message: 'Dados atualizados com sucesso.', user: user.toSafeJSON() });
  } catch (err) { next(err); }
}

module.exports = { register, login, logout, getMe, updateMe };
