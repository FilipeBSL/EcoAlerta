const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bairro = sequelize.define('Bairro', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  municipio: { type: DataTypes.STRING(100), allowNull: false, defaultValue: 'São Paulo' },
  uf: { type: DataTypes.CHAR(2), allowNull: false, defaultValue: 'SP' }
}, {
  tableName: 'bairros',
  timestamps: false
});

module.exports = Bairro;
