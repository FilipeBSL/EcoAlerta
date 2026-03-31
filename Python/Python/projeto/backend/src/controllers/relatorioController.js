const { Op, fn, col, literal } = require('sequelize');
const { Denuncia, Bairro } = require('../models');

async function getIndicadores(req, res, next) {
  try {
    const { data_inicio, data_fim } = req.query;
    const where = {};
    if (data_inicio) where.criado_em = { [Op.gte]: new Date(data_inicio) };
    if (data_fim) where.criado_em = { ...(where.criado_em || {}), [Op.lte]: new Date(data_fim) };

    const [total, porStatus, porBairro, tempoMedio] = await Promise.all([
      Denuncia.count({ where }),
      Denuncia.findAll({
        where,
        attributes: ['status', [fn('COUNT', col('id')), 'total']],
        group: ['status'],
        raw: true
      }),
      Denuncia.findAll({
        where,
        attributes: ['bairro_id', [fn('COUNT', col('Denuncia.id')), 'total']],
        include: [{ model: Bairro, as: 'bairro', attributes: ['nome'] }],
        group: ['bairro_id', 'bairro.id'],
        order: [[literal('total'), 'DESC']],
        limit: 10,
        raw: false
      }),
      Denuncia.findOne({
        where: { ...where, status: 'resolvida', resolvido_em: { [Op.ne]: null } },
        attributes: [[fn('AVG', literal('EXTRACT(EPOCH FROM (resolvido_em - criado_em))/3600')), 'media']],
        raw: true
      })
    ]);

    const totaisPorStatus = { geral: total };
    for (const row of porStatus) totaisPorStatus[row.status] = parseInt(row.total);

    return res.json({
      periodo: { inicio: data_inicio || null, fim: data_fim || null },
      totais: totaisPorStatus,
      por_bairro: porBairro.map(d => ({ bairro: d.bairro?.nome || 'N/I', total: parseInt(d.get('total')) })),
      tempo_medio_resolucao_horas: parseFloat(tempoMedio?.media || 0).toFixed(1)
    });
  } catch (err) { next(err); }
}

async function exportarCSV(req, res, next) {
  try {
    const { status, bairro_id, data_inicio, data_fim } = req.query;
    const where = {};
    if (status) where.status = { [Op.in]: status.split(',') };
    if (bairro_id) where.bairro_id = bairro_id;
    if (data_inicio) where.criado_em = { [Op.gte]: new Date(data_inicio) };
    if (data_fim) where.criado_em = { ...(where.criado_em || {}), [Op.lte]: new Date(data_fim) };

    const denuncias = await Denuncia.findAll({
      where,
      include: [{ model: Bairro, as: 'bairro', attributes: ['nome'] }],
      order: [['criado_em', 'DESC']]
    });

    const header = 'protocolo,data_criacao,bairro,endereco,status,data_resolucao\n';
    const rows = denuncias.map(d =>
      `${d.protocolo},${d.criado_em?.toISOString()},${d.bairro?.nome || ''},${(d.endereco_texto || '').replace(/,/g, ' ')},${d.status},${d.resolvido_em?.toISOString() || ''}`
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ecoalerta_relatorio.csv"`);
    return res.send(header + rows);
  } catch (err) { next(err); }
}

module.exports = { getIndicadores, exportarCSV };
