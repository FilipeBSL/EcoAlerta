const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FotoDenuncia = sequelize.define('FotoDenuncia', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  denuncia_id: { type: DataTypes.UUID, allowNull: false },
  url: { type: DataTypes.STRING(500), allowNull: false },
  nome_arquivo: { type: DataTypes.STRING(255), allowNull: false },
  tamanho_bytes: { type: DataTypes.INTEGER, allowNull: false },
  mime_type: { type: DataTypes.STRING(50), allowNull: false },
  ordem: { type: DataTypes.SMALLINT, allowNull: false, defaultValue: 1 }
}, {
  tableName: 'fotos_denuncia',
  timestamps: true,
  createdAt: 'criado_em',
  updatedAt: false
});

module.exports = FotoDenuncia;
