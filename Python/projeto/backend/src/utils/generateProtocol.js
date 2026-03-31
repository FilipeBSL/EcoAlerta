const { Denuncia } = require('../models');

async function generateProtocol() {
  const year = new Date().getFullYear();
  const count = await Denuncia.count({
    where: require('sequelize').literal(`EXTRACT(YEAR FROM criado_em) = ${year}`)
  });
  const seq = String(count + 1).padStart(6, '0');
  return `ECO-${year}-${seq}`;
}

module.exports = generateProtocol;
