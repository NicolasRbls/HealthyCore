const request = require('supertest');
const app = require('../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

// Mock OpenFoodFactsService
jest.mock('../../../src/modules/openfoodfacts/openfoodfacts.service', () => ({
    searchProducts: jest.fn().mockResolvedValue([])
}));

describe('Nutrition Routes', () => {
    let token;
    let testUser;
    let testFood;

    beforeAll(async () => {
        // Clean up
        const user = await prisma.users.findUnique({ where: { email: 'nutrition-route-test@example.com' } });
        if (user) {
            await prisma.suivis_nutritionnels.deleteMany({ where: { id_user: user.id_user } });
            await prisma.preferences_activites.deleteMany({ where: { preferences: { id_user: user.id_user } } });
            await prisma.preferences.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }

        const food = await prisma.aliments.findFirst({ where: { nom: 'Route Test Apple' } });
        if (food) {
            await prisma.suivis_nutritionnels.deleteMany({ where: { id_aliment: food.id_aliment } });
            await prisma.aliments.delete({ where: { id_aliment: food.id_aliment } });
        }

        // Create test user
        testUser = await prisma.users.create({
            data: {
                prenom: 'NutritionRoute',
                nom: 'Test',
                email: 'nutrition-route-test@example.com',
                mot_de_passe: 'password123',
                sexe: 'M',
                date_de_naissance: new Date('1990-01-01'),
                role: 'user'
            }
        });

        await prisma.preferences.create({
            data: {
                id_user: testUser.id_user,
                objectif_poids: 70,
                id_niveau_sedentarite: 1,
                id_repartition_nutritionnelle: 1,
                id_regime_alimentaire: 1,
                seances_par_semaines: 3,
                bmr: 1500,
                tdee: 2000,
                calories_quotidiennes: 2000
            }
        });

        // Create test food
        testFood = await prisma.aliments.create({
            data: {
                nom: 'Route Test Apple',
                calories: 52,
                proteines: 0.3,
                glucides: 14,
                lipides: 0.2,
                type: 'produit',
                source: 'user',
                temps_preparation: 0
            }
        });

        // Generate token
        token = jwt.sign(
            { userId: testUser.id_user, email: testUser.email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        if (testUser) {
            await prisma.suivis_nutritionnels.deleteMany({ where: { id_user: testUser.id_user } });
            await prisma.preferences_activites.deleteMany({ where: { preferences: { id_user: testUser.id_user } } });
            await prisma.preferences.deleteMany({ where: { id_user: testUser.id_user } });
            await prisma.users.delete({ where: { id_user: testUser.id_user } });
        }
        if (testFood) {
            await prisma.aliments.delete({ where: { id_aliment: testFood.id_aliment } });
        }
        await prisma.$disconnect();
    });

    describe('GET /api/nutrition', () => {
        it('should return a list of foods', async () => {
            const res = await request(app)
                .get('/api/nutrition')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('foods');
            expect(res.body.data.foods.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/nutrition/:id', () => {
        it('should return food details', async () => {
            const res = await request(app)
                .get(`/api/nutrition/${testFood.id_aliment}`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('name', 'Route Test Apple');
        });
    });

    describe('POST /api/nutrition/user/log', () => {
        it('should log a food item', async () => {
            const logData = {
                foodId: testFood.id_aliment,
                quantity: 100,
                meal: 'lunch',
                date: new Date().toISOString()
            };

            const res = await request(app)
                .post('/api/nutrition/user/log')
                .set('Authorization', `Bearer ${token}`)
                .send(logData);

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('nutritionEntry');
        });
    });
});
