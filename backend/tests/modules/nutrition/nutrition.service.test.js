const nutritionService = require('../../../src/modules/nutrition/nutrition.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock OpenFoodFactsService to avoid external API calls
jest.mock('../../../src/modules/openfoodfacts/openfoodfacts.service', () => ({
    searchProducts: jest.fn().mockResolvedValue([])
}));

describe('Nutrition Service', () => {
    let testUser;
    let testFood;

    beforeAll(async () => {
        // Clean up
        const user = await prisma.users.findUnique({ where: { email: 'nutrition-service-test@example.com' } });
        if (user) {
            await prisma.suivis_nutritionnels.deleteMany({ where: { id_user: user.id_user } });
            await prisma.preferences_activites.deleteMany({ where: { preferences: { id_user: user.id_user } } });
            await prisma.preferences.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }

        // Clean up test food if exists
        const food = await prisma.aliments.findFirst({ where: { nom: 'Test Apple' } });
        if (food) {
            await prisma.suivis_nutritionnels.deleteMany({ where: { id_aliment: food.id_aliment } });
            await prisma.aliments.delete({ where: { id_aliment: food.id_aliment } });
        }

        // Create test user
        testUser = await prisma.users.create({
            data: {
                prenom: 'Nutrition',
                nom: 'Test',
                email: 'nutrition-service-test@example.com',
                mot_de_passe: 'password123',
                sexe: 'M',
                date_de_naissance: new Date('1990-01-01'),
                role: 'user'
            }
        });

        // Create preferences for user (needed for nutrition summary)
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
                nom: 'Test Apple',
                calories: 52,
                proteines: 0.3,
                glucides: 14,
                lipides: 0.2,
                type: 'produit',
                source: 'user',
                temps_preparation: 0
            }
        });
    });

    afterAll(async () => {
        // Clean up
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

    describe('getAllFoods', () => {
        it('should return a list of foods', async () => {
            const result = await nutritionService.getAllFoods({ limit: 10 });
            expect(result).toHaveProperty('foods');
            expect(Array.isArray(result.foods)).toBe(true);
            expect(result.foods.length).toBeGreaterThan(0);
            expect(result.foods.some(f => f.name === 'Test Apple')).toBe(true);
        });

        it('should filter foods by search term', async () => {
            const result = await nutritionService.getAllFoods({ search: 'Test Apple' });
            expect(result.foods.length).toBeGreaterThan(0);
            expect(result.foods[0].name).toBe('Test Apple');
        });
    });

    describe('getFoodById', () => {
        it('should return food details', async () => {
            const food = await nutritionService.getFoodById(testFood.id_aliment);
            expect(food).toHaveProperty('name', 'Test Apple');
            expect(food).toHaveProperty('calories', 52);
        });

        it('should throw error if food not found', async () => {
            await expect(nutritionService.getFoodById(99999)).rejects.toThrow();
        });
    });

    describe('logNutrition', () => {
        it('should log a food item for the user', async () => {
            const logData = {
                foodId: testFood.id_aliment,
                quantity: 100,
                meal: 'breakfast',
                date: new Date().toISOString()
            };

            const result = await nutritionService.logNutrition(testUser.id_user, logData);

            expect(result).toHaveProperty('nutritionEntry');
            expect(result.nutritionEntry).toHaveProperty('food');
            expect(result.nutritionEntry.food).toHaveProperty('name', 'Test Apple');
            expect(result.nutritionEntry).toHaveProperty('quantity', 100);
        });
    });

    describe('getNutritionSummary', () => {
        it('should return nutrition summary for the user', async () => {
            const summary = await nutritionService.getNutritionSummary(testUser.id_user);

            expect(summary).toHaveProperty('calorieGoal');
            expect(summary).toHaveProperty('caloriesConsumed');
            // Since we logged 100g of apple (52 cal) in the previous test
            expect(summary.caloriesConsumed).toBe(52);
        });
    });
});
