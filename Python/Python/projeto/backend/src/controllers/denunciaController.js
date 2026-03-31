const denunciaService = require('../services/denunciaService');

async function create(req, res, next) {
  try {
    const { descricao, latitude, longitude, endereco_texto } = req.body;
    const arquivos = req.files || [];

    if (!descricao || !latitude || !longitude) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'descricao, latitude e longitude são obrigatórios.' } });
    }
    if (arquivos.length === 0) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Pelo menos uma foto é obrigatória.' } });
    }

    const denuncia = await denunciaService.create({
      descricao, latitude, longitude, endereco_texto,
      arquivos, userId: req.user.id
    });
    return res.status(201).json({ message: 'Denúncia registrada com sucesso!', denuncia });
  } catch (err) { next(err); }
}

async function list(req, res, next) {
  try {
    const result = await denunciaService.list({
      userId: req.user.id,
      perfil: req.user.perfil,
      ...req.query
    });
    return res.json(result);
  } catch (err) { next(err); }
}

async function findById(req, res, next) {
  try {
    const denuncia = await denunciaService.findById(req.params.id, req.user.id, req.user.perfil);
    return res.json(denuncia);
  } catch (err) { next(err); }
}

async function updateStatus(req, res, next) {
  try {
    const { status, comentario, equipe_id } = req.body;
    if (!status) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'status é obrigatório.' } });
    }
    const denuncia = await denunciaService.updateStatus({
      id: req.params.id, status, comentario, equipe_id, adminId: req.user.id
    });
    return res.json({ message: 'Status atualizado com sucesso.', denuncia });
  } catch (err) { next(err); }
}

async function cancel(req, res, next) {
  try {
    await denunciaService.cancel(req.params.id, req.user.id);
    return res.json({ message: 'Denúncia cancelada com sucesso.' });
  } catch (err) { next(err); }
}

module.exports = { create, list, findById, updateStatus, cancel };
