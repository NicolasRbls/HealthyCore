const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

const { connectDB } = require('./config/db');
const User = require('./models/User');
const userRoutes = require('./routes/userRoutes');

// Connexion à la base de données
const startServer = async () => {
  try {
    console.log('Tentative de connexion à la base de données...');
    await connectDB();

    // Synchroniser les modèles avec la base de données
    await User.sync(); // Utiliser `{ alter: true }` en cas de modification de la structure
    console.log('Modèles synchronisés avec PostgreSQL');

    // Démarrer le serveur
    const PORT = process.env.PORT || 5001;
    const server = app.listen(PORT, () => {
      console.log(`Serveur lancé sur le port ${PORT}`);
    });

    // Gestion des erreurs du serveur
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Erreur : Le port ${PORT} est déjà utilisé.`);
        process.exit(1); // Quitte le processus proprement
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error('Erreur lors du démarrage du serveur :', error.message);
    process.exit(1); // Quitte le processus proprement en cas d'erreur critique
  }
};

// Routes principales
app.get('/', (req, res) => {
  res.json({ message: 'HealthyCore API en ligne !' });
});

// Routes utilisateur
app.use('/api/users', userRoutes);

// Lancer le serveur
startServer();
