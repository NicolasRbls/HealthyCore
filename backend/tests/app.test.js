const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Augmenter le timeout global pour Jest
jest.setTimeout(30000);

// Configuration pour nettoyer la base de données entre les tests
beforeAll(async () => {
  try {
    // Vérifier la connexion à la base de données
    await prisma.$connect();
    console.log('Connexion à la base de données établie');
    
    // Vider les tables pertinentes si elles existent
    try {
      await prisma.$executeRaw`TRUNCATE TABLE users CASCADE`;
      console.log('Tableau users vidé avec succès');
    } catch (truncateError) {
      console.error('Erreur lors du vidage des tables:', truncateError.message);
      // Continuer même si l'opération échoue (les tables peuvent ne pas exister)
    }

    // Préparation des données initiales nécessaires
    try {
      // Vérifier si les données de base existent déjà
      const sedentaryLevelCount = await prisma.niveaux_sedentarites.count();
      const dietCount = await prisma.regimes_alimentaires.count();
      const nutritionalPlanCount = await prisma.repartitions_nutritionnelles.count();
      const activityCount = await prisma.activites.count();

      // Si certaines données manquent, créer des données minimales pour les tests
      if (sedentaryLevelCount === 0) {
        await prisma.niveaux_sedentarites.createMany({
          data: [
            { nom: 'Test Sédentaire', description: 'Pour tests', valeur: 1.2 },
            { nom: 'Test Actif', description: 'Pour tests', valeur: 1.5 }
          ],
          skipDuplicates: true
        });
        console.log('Niveaux de sédentarité créés');
      }

      if (dietCount === 0) {
        await prisma.regimes_alimentaires.createMany({
          data: [{ nom: 'Test Régime', description: 'Pour tests' }],
          skipDuplicates: true
        });
        console.log('Régimes alimentaires créés');
      }

      if (nutritionalPlanCount === 0) {
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
        console.log('Répartitions nutritionnelles créées');
      }

      if (activityCount === 0) {
        await prisma.activites.createMany({
          data: [
            { nom: 'Test Activité 1', description: 'Pour tests' },
            { nom: 'Test Activité 2', description: 'Pour tests' }
          ],
          skipDuplicates: true
        });
        console.log('Activités créées');
      }
    } catch (seedError) {
      console.error('Erreur lors de la création des données de test:', seedError.message);
      // Continuer même en cas d'erreur, les tests peuvent échouer gracieusement
    }

  } catch (error) {
    console.error('Erreur lors de la configuration des tests:', error.message);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
  console.log('Déconnexion de la base de données');
});

// Test de santé de l'API
describe('/api/health', () => {
  it('doit renvoyer 200 et { status: "healthy" }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'healthy');
    expect(res.body).toHaveProperty('version');
  });
});

// Tests d'authentification
describe('Tests d\'authentification', () => {
  // Données de test pour l'utilisateur
  const testUser = {
    firstName: 'Test',
    lastName: 'User',
    email: `test_${Date.now()}@example.com`, // Email unique pour éviter les conflits
    password: 'password123',
    gender: 'NS',
    birthDate: '2000-01-01',
    weight: 70,
    height: 175,
    targetWeight: 68,
    nutritionalPlanId: 1, // Utilisez un ID qui existe dans votre base de données
    dietId: 1, // Utilisez un ID qui existe dans votre base de données
    sedentaryLevelId: 1, // Utilisez un ID qui existe dans votre base de données
    sessionsPerWeek: 3,
    activities: [1], // Utilisez des IDs qui existent dans votre base de données
    // Ajout des valeurs manquantes pour éviter les erreurs Decimal
    bmr: 1600,
    tdee: 1920,
    dailyCalories: 1700,
    caloricDeficitSurplus: -220,
    targetDurationWeeks: 12
  };

  let authToken;

  // Tests d'inscription
  describe('/api/auth/register', () => {
    it('doit enregistrer un nouvel utilisateur avec succès', async () => {
      console.log('Test d\'inscription avec:', testUser.email);
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      // Log pour le debug
      if (res.statusCode !== 201) {
        console.error('Erreur lors de l\'inscription:', res.body);
      }
      
      expect(res.statusCode).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('firstName', testUser.firstName);
      expect(res.body.data.user).toHaveProperty('email', testUser.email);
    }, 10000); // Timeout augmenté pour ce test spécifique

    it('doit refuser l\'inscription avec un email déjà utilisé', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toBe(409);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('doit refuser l\'inscription avec des données incomplètes', async () => {
      const incompleteUser = { ...testUser };
      delete incompleteUser.email;
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(incompleteUser);
      
      expect(res.statusCode).toBe(400);
      expect(res.body.status).toBe('error');
    });
  });

  // Tests de connexion
  describe('/api/auth/login', () => {
    it('doit connecter un utilisateur avec des identifiants valides', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      // Log pour le debug
      if (res.statusCode !== 200) {
        console.error('Erreur lors de la connexion:', res.body);
      }
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('token');
      
      // Sauvegarder le token pour les tests ultérieurs
      authToken = res.body.data.token;
    });

    it('doit refuser la connexion avec un email incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: testUser.password
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });

    it('doit refuser la connexion avec un mot de passe incorrect', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
      expect(res.body.code).toBe('INVALID_CREDENTIALS');
    });
  });

  // Tests de vérification de token
  describe('/api/auth/verify-token', () => {
    it('doit vérifier un token valide', async () => {
      // S'assurer que le token existe
      if (!authToken) {
        console.warn('Token manquant pour le test de vérification');
        return;
      }
      
      const res = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', `Bearer ${authToken}`);
      
      // Log pour le debug
      if (res.statusCode !== 200) {
        console.error('Erreur lors de la vérification du token:', res.body);
      }
      
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data).toHaveProperty('valid', true);
    });

    it('doit rejeter un token invalide', async () => {
      const res = await request(app)
        .get('/api/auth/verify-token')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(res.statusCode).toBe(401);
      expect(res.body.status).toBe('error');
    });
  });
});