const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HistoricoStatus = sequelize.define('HistoricoStatus', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  denuncia_id: { type: DataTypes.UUID, allowNull: false },
  usuario_id: { type: DataTypes.UUID, allowNull: false },
  status_anterior: {
    type: DataTypes.ENUM('pendente', 'em_analise', 'em_atendimento', 'resolvida', 'cancelada', 'invalida'),
    allowNull: true
  },
  status_novo: {
    type: DataTypes.ENUM('pendente', 'em_analise', 'em_atendimento', 'resolvida', 'cancelada', 'invalida'),
    allowNull: false
  },
  comentario: { type: DataTypes.STRING(500), allowNull: true }
}, {
  tableName: 'historico_status',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: false
});

module.exports = HistoricoStatus;
