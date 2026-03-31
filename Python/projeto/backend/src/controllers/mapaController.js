const { Op } = require('sequelize');
const { Denuncia, FotoDenuncia, Bairro } = require('../models');

async function getPontos(req, res, next) {
  try {
    const { status, dias, bbox } = req.query;
    const where = {
      status: { [Op.notIn]: ['cancelada', 'invalida'] }
    };

    if (status) where.status = { [Op.in]: status.split(',') };

    if (dias) {
      const desde = new Date();
      desde.setDate(desde.getDate() - parseInt(dias));
      where.criado_em = { [Op.gte]: desde };
    }

    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox.split(',').map(Number);
      where.latitude = { [Op.between]: [minLat, maxLat] };
      where.longitude = { [Op.between]: [minLng, maxLng] };
    }

    const pontos = await Denuncia.findAll({
      where,
      attributes: ['id', 'protocolo', 'status', 'latitude', 'longitude', 'descricao', 'criado_em'],
      include: [
        { model: FotoDenuncia, as: 'fotos', attributes: ['url'], limit: 1, order: [['ordem', 'ASC']] },
        { model: Bairro, as: 'bairro', attributes: ['nome'] }
      ],
      order: [['criado_em', 'DESC']],
      limit: 1000
    });

    return res.json({
      total: pontos.length,
      pontos: pontos.map(p => ({
        id: p.id,
        protocolo: p.protocolo,
        status: p.status,
        latitude: parseFloat(p.latitude),
        longitude: parseFloat(p.longitude),
        bairro: p.bairro?.nome || null,
        foto_capa: p.fotos?.[0]?.url || null,
        descricao_curta: p.descricao?.slice(0, 80) + (p.descricao?.length > 80 ? '...' : ''),
        criado_em: p.criado_em
      }))
    });
  } catch (err) { next(err); }
}

module.exports = { getPontos };
