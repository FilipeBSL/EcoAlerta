function authorize(...perfis) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Não autenticado.' } });
    }
    if (!perfis.includes(req.user.perfil)) {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Sem permissão para esta ação.' } });
    }
    next();
  };
}

module.exports = authorize;
