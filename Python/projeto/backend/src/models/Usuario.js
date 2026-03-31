const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nome: { type: DataTypes.STRING(150), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true, validate: { isEmail: true } },
  senha_hash: { type: DataTypes.STRING(255), allowNull: false },
  perfil: {
    type: DataTypes.ENUM('cidadao', 'administrador', 'equipe_limpeza'),
    allowNull: false,
    defaultValue: 'cidadao'
  },
  ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  municipio: { type: DataTypes.STRING(100), allowNull: true }
}, {
  tableName: 'usuarios',
  hooks: {
    beforeCreate: async (user) => {
      user.senha_hash = await bcrypt.hash(user.senha_hash, 10);
    },
    beforeUpdate: async (user) => {
      if (user.changed('senha_hash')) {
        user.senha_hash = await bcrypt.hash(user.senha_hash, 10);
      }
    }
  }
});

Usuario.prototype.checkPassword = async function (senha) {
  return bcrypt.compare(senha, this.senha_hash);
};

Usuario.prototype.toSafeJSON = function () {
  const { senha_hash, ...safe } = this.toJSON();
  return safe;
};

module.exports = Usuario;
