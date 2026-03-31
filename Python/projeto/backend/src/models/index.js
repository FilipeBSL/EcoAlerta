const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Bairro = require('./Bairro');
const EquipeLimpeza = require('./EquipeLimpeza');
const Denuncia = require('./Denuncia');
const FotoDenuncia = require('./FotoDenuncia');
const HistoricoStatus = require('./HistoricoStatus');

// Associações
Usuario.hasMany(Denuncia, { foreignKey: 'usuario_id', as: 'denuncias' });
Denuncia.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Bairro.hasMany(Denuncia, { foreignKey: 'bairro_id', as: 'denuncias' });
Denuncia.belongsTo(Bairro, { foreignKey: 'bairro_id', as: 'bairro' });

EquipeLimpeza.hasMany(Denuncia, { foreignKey: 'equipe_id', as: 'denuncias' });
Denuncia.belongsTo(EquipeLimpeza, { foreignKey: 'equipe_id', as: 'equipe' });

Denuncia.hasMany(FotoDenuncia, { foreignKey: 'denuncia_id', as: 'fotos', onDelete: 'CASCADE' });
FotoDenuncia.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });

Denuncia.hasMany(HistoricoStatus, { foreignKey: 'denuncia_id', as: 'historico', onDelete: 'CASCADE' });
HistoricoStatus.belongsTo(Denuncia, { foreignKey: 'denuncia_id' });
HistoricoStatus.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

module.exports = {
  sequelize,
  Usuario,
  Bairro,
  EquipeLimpeza,
  Denuncia,
  FotoDenuncia,
  HistoricoStatus
};
