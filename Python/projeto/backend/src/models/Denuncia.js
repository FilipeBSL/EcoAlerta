const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Denuncia = sequelize.define('Denuncia', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  usuario_id: { type: DataTypes.UUID, allowNull: false },
  bairro_id: { type: DataTypes.INTEGER, allowNull: true },
  equipe_id: { type: DataTypes.INTEGER, allowNull: true },
  descricao: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: { len: [10, 500] }
  },
  status: {
    type: DataTypes.ENUM('pendente', 'em_analise', 'em_atendimento', 'resolvida', 'cancelada', 'invalida'),
    allowNull: false,
    defaultValue: 'pendente'
  },
  endereco_texto: { type: DataTypes.STRING(300), allowNull: true },
  latitude: { type: DataTypes.DECIMAL(10, 8), allowNull: false },
  longitude: { type: DataTypes.DECIMAL(11, 8), allowNull: false },
  protocolo: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  resolvido_em: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: 'denuncias',
  indexes: [
    { fields: ['status'] },
    { fields: ['bairro_id'] },
    { fields: ['usuario_id'] },
    { fields: ['criado_em'] }
  ]
});

module.exports = Denuncia;
