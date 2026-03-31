const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EquipeLimpeza = sequelize.define('EquipeLimpeza', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  responsavel: { type: DataTypes.STRING(150), allowNull: false },
  ativa: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true }
}, {
  tableName: 'equipes_limpeza',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: false
});

module.exports = EquipeLimpeza;
