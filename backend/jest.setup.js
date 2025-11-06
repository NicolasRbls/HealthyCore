const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configurer l'URL de la base de données pour les tests
process.env.DATABASE_URL = 'postgresql://admin:admin@localhost:5432/db_healthycore_test?schema=public';

// Configurer les autres variables d'environnement nécessaires pour les tests
process.env.JWT_SECRET = 'test_secret_key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.PORT = '5001'; // Port différent pour les tests

// Avant tous les tests
beforeAll(async () => {
  try {
    // Migrer la base de données de test
    execSync('npx prisma migrate deploy', { env: process.env });
    // Initialiser les données de test minimales nécessaires
    await seedTestData();
  } catch (error) {
    console.error('Setup error:', error);
    throw error;
  }
});

// Après tous les tests
afterAll(async () => {
  await prisma.$disconnect();
});

// Fonction pour initialiser des données de test minimales
async function seedTestData() {
  try {
    // Créer des données de base nécessaires pour les tests
    await prisma.niveaux_sedentarites.createMany({
      data: [
        { nom: 'Test Sédentaire', description: 'Pour tests', valeur: 1.2 },
        { nom: 'Test Actif', description: 'Pour tests', valeur: 1.5 }
      ],
      skipDuplicates: true
    });
    
    await prisma.regimes_alimentaires.createMany({
      data: [{ nom: 'Test Régime', description: 'Pour tests' }],
      skipDuplicates: true
    });
    
    await prisma.repartitions_nutritionnelles.createMany({
      data: [{
        nom: 'Test Répartition',
        description: 'Pour tests',
        type: 'perte_de_poids',
        pourcentage_glucides: 50,
        pourcentage_proteines: 30,
        pourcentage_lipides: 20
      }],
      skipDuplicates: true
    });
    
    await prisma.activites.createMany({
      data: [
        { nom: 'Test Activité 1', description: 'Pour tests' },
        { nom: 'Test Activité 2', description: 'Pour tests' }
      ],
      skipDuplicates: true
    });
    
    await prisma.objectifs.createMany({
      data: [
        { titre: 'Ajouter un aliment à son suivi quotidien' },
        { titre: 'Effectuer la séance du jour' }
      ],
      skipDuplicates: true
    });
    
  } catch (error) {
    console.error('Seeding error:', error);
    throw error;
  }
}