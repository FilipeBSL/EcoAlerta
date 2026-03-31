const { Op } = require('sequelize');
const { Denuncia, FotoDenuncia, HistoricoStatus, Bairro, Usuario, EquipeLimpeza } = require('../models');
const { uploadFile } = require('./storageService');
const { sendDenunciaConfirmation, sendStatusUpdate } = require('./emailService');
const generateProtocol = require('../utils/generateProtocol');
const { isValidTransition, isInsideMunicipio } = require('../utils/validators');

async function create({ descricao, latitude, longitude, endereco_texto, arquivos, userId }) {
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);

  if (!isInsideMunicipio(lat, lng)) {
    const err = new Error('Coordenadas fora da área do município.');
    err.status = 422; err.code = 'UNPROCESSABLE_ENTITY';
    throw err;
  }

  const protocolo = await generateProtocol();

  const denuncia = await Denuncia.create({
    usuario_id: userId,
    descricao,
    latitude: lat,
    longitude: lng,
    endereco_texto,
    protocolo,
    status: 'pendente'
  });

  // Upload das fotos
  const fotosUrls = [];
  for (let i = 0; i < arquivos.length; i++) {
    const arq = arquivos[i];
    const { url, filename } = await uploadFile(arq.buffer, arq.originalname, arq.mimetype);
    await FotoDenuncia.create({
      denuncia_id: denuncia.id,
      url,
      nome_arquivo: filename,
      tamanho_bytes: arq.size,
      mime_type: arq.mimetype,
      ordem: i + 1
    });
    fotosUrls.push(url);
  }

  // Histórico inicial
  await HistoricoStatus.create({
    denuncia_id: denuncia.id,
    usuario_id: userId,
    status_anterior: null,
    status_novo: 'pendente',
    comentario: 'Denúncia registrada.'
  });

  // E-mail de confirmação (assíncrono)
  const user = await Usuario.findByPk(userId);
  sendDenunciaConfirmation(user.email, user.nome, protocolo);

  return { ...denuncia.toJSON(), fotos: fotosUrls };
}

async function list({ userId, perfil, status, bairro_id, data_inicio, data_fim, page = 1, limit = 20 }) {
  const where = {};
  if (perfil === 'cidadao') where.usuario_id = userId;
  if (status) where.status = { [Op.in]: status.split(',') };
  if (bairro_id) where.bairro_id = bairro_id;
  if (data_inicio || data_fim) {
    where.criado_em = {};
    if (data_inicio) where.criado_em[Op.gte] = new Date(data_inicio);
    if (data_fim) where.criado_em[Op.lte] = new Date(data_fim);
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await Denuncia.findAndCountAll({
    where,
    include: [
      { model: FotoDenuncia, as: 'fotos', limit: 1, order: [['ordem', 'ASC']] },
      { model: Bairro, as: 'bairro', attributes: ['id', 'nome'] }
    ],
    order: [['criado_em', 'DESC']],
    limit: parseInt(limit),
    offset,
    distinct: true
  });

  return {
    data: rows.map(d => ({
      id: d.id,
      protocolo: d.protocolo,
      status: d.status,
      descricao: d.descricao,
      bairro: d.bairro?.nome,
      foto_capa: d.fotos?.[0]?.url || null,
      criado_em: d.criado_em
    })),
    pagination: {
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(count / parseInt(limit))
    }
  };
}

async function findById(id, userId, perfil) {
  const denuncia = await Denuncia.findByPk(id, {
    include: [
      { model: FotoDenuncia, as: 'fotos', order: [['ordem', 'ASC']] },
      { model: Bairro, as: 'bairro', attributes: ['id', 'nome'] },
      {
        model: HistoricoStatus,
        as: 'historico',
        order: [['criado_em', 'ASC']],
        include: [{ model: Usuario, as: 'usuario', attributes: ['nome'] }]
      }
    ]
  });

  if (!denuncia) {
    const err = new Error('Denúncia não encontrada.'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
  }
  if (perfil === 'cidadao' && denuncia.usuario_id !== userId) {
    const err = new Error('Acesso negado.'); err.status = 403; err.code = 'FORBIDDEN'; throw err;
  }

  return denuncia;
}

async function updateStatus({ id, status, comentario, equipe_id, adminId }) {
  const denuncia = await Denuncia.findByPk(id, {
    include: [{ model: Usuario, as: 'usuario', attributes: ['email', 'nome'] }]
  });

  if (!denuncia) {
    const err = new Error('Denúncia não encontrada.'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
  }

  if (!isValidTransition(denuncia.status, status)) {
    const err = new Error(`Transição de "${denuncia.status}" para "${status}" não permitida.`);
    err.status = 400; err.code = 'INVALID_STATUS_TRANSITION'; throw err;
  }

  const statusAnterior = denuncia.status;
  const updates = { status, equipe_id: equipe_id || denuncia.equipe_id };
  if (status === 'resolvida') updates.resolvido_em = new Date();
  await denuncia.update(updates);

  await HistoricoStatus.create({
    denuncia_id: id,
    usuario_id: adminId,
    status_anterior: statusAnterior,
    status_novo: status,
    comentario
  });

  sendStatusUpdate(denuncia.usuario.email, denuncia.usuario.nome, denuncia.protocolo, status, comentario);
  return denuncia;
}

async function cancel(id, userId) {
  const denuncia = await Denuncia.findByPk(id);
  if (!denuncia) {
    const err = new Error('Denúncia não encontrada.'); err.status = 404; err.code = 'NOT_FOUND'; throw err;
  }
  if (denuncia.usuario_id !== userId) {
    const err = new Error('Acesso negado.'); err.status = 403; err.code = 'FORBIDDEN'; throw err;
  }
  if (denuncia.status !== 'pendente') {
    const err = new Error('Apenas denúncias pendentes podem ser canceladas.');
    err.status = 403; err.code = 'FORBIDDEN'; throw err;
  }
  await denuncia.update({ status: 'cancelada' });
  await HistoricoStatus.create({
    denuncia_id: id, usuario_id: userId,
    status_anterior: 'pendente', status_novo: 'cancelada', comentario: 'Cancelada pelo cidadão.'
  });
}

module.exports = { create, list, findById, updateStatus, cancel };
