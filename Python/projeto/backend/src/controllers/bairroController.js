const { Bairro } = require('../models');

async function list(req, res, next) {
  try {
    const bairros = await Bairro.findAll({ order: [['nome', 'ASC']] });
    return res.json({ data: bairros });
  } catch (err) { next(err); }
}

module.exports = { list };
