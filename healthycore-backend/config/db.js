const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: console.log, // Activer les logs SQL pour déboguer
    dialectOptions: {
      connectTimeout: 60000, // Augmenter le délai de connexion si nécessaire
    },
  }
);

const connectDB = async () => {
  console.log('Tentative de connexion avec les paramètres :', {
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  });

  try {
    await sequelize.authenticate();
    console.log('Connexion réussie à PostgreSQL');
  } catch (error) {
    console.error('Erreur de connexion à PostgreSQL :', error.message);
  }
};

module.exports = { sequelize, connectDB };
