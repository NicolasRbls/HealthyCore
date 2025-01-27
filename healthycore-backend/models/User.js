const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  id_user: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: false,
    defaultValue: 'user',
  },
  prenom: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  nom: {
    type: DataTypes.STRING(50),
    allowNull: false,
  },
  sexe: {
    type: DataTypes.ENUM('M', 'F', 'NS'),
    allowNull: false,
    defaultValue: 'NS',
  },
  date_de_naissance: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
  },
  mot_de_passe: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cree_a: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  mis_a_jour_a: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'users', // Nom exact de la table dans la BDD
  timestamps: false, // Désactiver la gestion automatique des timestamps
});

module.exports = User;
