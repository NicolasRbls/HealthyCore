require("dotenv").config();
const app = require("./src/app");
const config = require("./src/config/config");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

// Fonction pour tester la connexion à la base de données
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Database connection successful");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Démarrage du serveur
async function startServer() {
  try {
    // Vérifier la connexion à la base de données avant de démarrer le serveur
    await testDatabaseConnection();

    app.listen(config.PORT, () => {
      console.log(`Server running on port ${config.PORT}`);
      console.log(`API available at ${config.API_URL}`);
      console.log(`Environment: ${config.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
