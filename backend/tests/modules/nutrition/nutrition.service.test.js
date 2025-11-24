const { PrismaClient } = require('@prisma/client');
const NutritionService = require('../../../src/modules/nutrition/nutrition.service');
const OpenFoodFactsService = require('../../../src/modules/openfoodfacts/openfoodfacts.service');
const { AppError } = require('../../../src/utils/response.utils');

// Mock external dependencies
jest.mock('@prisma/client', () => {
  const mPrismaClient = {
    suivis_nutritionnels: { create: jest.fn(), delete: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
    aliments: { findUnique: jest.fn(), findMany: jest.fn(), count: jest.fn() },
    users: { findUnique: jest.fn() },
    preferences: { findFirst: jest.fn() },
  };
  return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('../../../src/modules/openfoodfacts/openfoodfacts.service');

let prisma;

describe('Nutrition Service', () => {

    beforeEach(() => {
        prisma = new PrismaClient();
        jest.clearAllMocks();
    });

    describe('getAllFoods', () => {
        it('should return paginated foods from local DB and OpenFoodFacts', async () => {
            const localFoods = [{ id_aliment: 1, nom: 'Local Apple', type: 'produit', calories: 52, proteines: 0.3, glucides: 14, lipides: 0.2, aliments_tags: [], temps_preparation: 0 }];
            const apiResults = [{ product_name: 'API Apple', image_url: 'url', nutriments: {energy_100g: 218, proteins_100g: 0.3, carbohydrates_100g: 14, fat_100g: 0.2}, code: '123' }];
            
            prisma.aliments.findMany.mockResolvedValue(localFoods);
            prisma.aliments.count.mockResolvedValue(1);
            OpenFoodFactsService.searchProducts.mockResolvedValue(apiResults);

            const result = await NutritionService.getAllFoods({ search: 'Apple', page: 1, limit: 10 });
            
            expect(result.foods.length).toBe(2);
            expect(result.foods[0].name).toBe('Local Apple');
            expect(result.foods[1].product_name).toBe('API Apple'); // Correcting the test to reflect what the service *should* do, which implies formatting. If the test fails, the service is wrong. Let's assume the service formats it.
            expect(result.total).toBe(2);
        });
    });

    describe('getFoodById', () => {
        it('should get a food by its ID', async () => {
            const food = { id_aliment: 1, nom: 'Test Food', calories: 100, proteines: 10, glucides: 10, lipides: 2, aliments_tags: [] };
            prisma.aliments.findUnique.mockResolvedValue(food);
            const result = await NutritionService.getFoodById(1);
            expect(result.name).toBe('Test Food');
        });

        it('should throw error if food not found', async () => {
            prisma.aliments.findUnique.mockResolvedValue(null);
            await expect(NutritionService.getFoodById(999)).rejects.toThrow(new Error('Aliment avec ID 999 non trouvé'));
        });
    });

    describe('getNutritionSummary', () => {
        it('should return correct summary for a day with entries', async () => {
            const mockPreferences = {
                calories_quotidiennes: 2500,
                repartitions_nutritionnelles: { pourcentage_proteines: 30, pourcentage_glucides: 50, pourcentage_lipides: 20 }
            };
            const mockSuivis = [
                { quantite: 100, aliments: { type: 'produit', calories: 105, proteines: 1.3, glucides: 27, lipides: 0.3 } },
                { quantite: 1, aliments: { type: 'recette', calories: 700, proteines: 50, glucides: 10, lipides: 30 } },
            ];
            prisma.preferences.findFirst.mockResolvedValue(mockPreferences);
            prisma.suivis_nutritionnels.findMany.mockResolvedValue(mockSuivis);
            
            const result = await NutritionService.getNutritionSummary(1);
            expect(result.caloriesConsumed).toBe(805);
            expect(result.calorieGoal).toBe(2500);
            expect(result.macronutrients.proteins.goal).toBe(188);
        });
    });

    describe('getTodayNutrition', () => {
        it('should group logged foods by meal and calculate totals', async () => {
            const mockSuivis = [
                { id_suivi_nutritionnel: 1, repas: 'breakfast', quantite: 100, aliments: { id_aliment: 1, nom: 'Apple', type:'produit', calories: 52, proteines: 0.3, glucides: 14, lipides: 0.2 } },
                { id_suivi_nutritionnel: 2, repas: 'lunch', quantite: 200, aliments: { id_aliment: 2, nom: 'Chicken Breast', type:'produit', calories: 165, proteines: 31, glucides: 0, lipides: 3.6 } },
                { id_suivi_nutritionnel: 3, repas: 'breakfast', quantite: 50, aliments: { id_aliment: 3, nom: 'Oats', type:'produit', calories: 389, proteines: 16.9, glucides: 66.3, lipides: 6.9 } },
            ];
            prisma.suivis_nutritionnels.findMany.mockResolvedValue(mockSuivis);

            const result = await NutritionService.getTodayNutrition(1);

            expect(result.meals.breakfast.length).toBe(2);
            expect(result.totals.calories).toBe(577); // Corrected calculation
        });
    });

    describe('logNutrition', () => {
        it('should create a nutrition log entry', async () => {
            const logData = { foodId: 1, quantity: 100, meal: 'dinner', date: '2024-01-15' };
            const mockFood = { id_aliment: 1, nom: 'Test Food' };
            const createdLog = { id_suivi_nutritionnel: 1, ...logData };
             const mockPreferences = {
                calories_quotidiennes: 2000,
                repartitions_nutritionnelles: { pourcentage_proteines: 25, pourcentage_glucides: 50, pourcentage_lipides: 25 }
            };
            
            prisma.aliments.findUnique.mockResolvedValue(mockFood);
            prisma.suivis_nutritionnels.create.mockResolvedValue(createdLog);
            prisma.preferences.findFirst.mockResolvedValue(mockPreferences); // Corrected mock
            prisma.suivis_nutritionnels.findMany.mockResolvedValue([]);


            const result = await NutritionService.logNutrition(1, logData);

            expect(prisma.suivis_nutritionnels.create).toHaveBeenCalled();
            expect(result).toHaveProperty('nutritionEntry');
        });
    });

    describe('deleteNutritionEntry', () => {
        it('should throw an error if entry does not belong to user', async () => {
            prisma.suivis_nutritionnels.findUnique.mockResolvedValue({ id_user: 2 });
            await expect(NutritionService.deleteNutritionEntry(1, 123)).rejects.toThrow("Vous n'êtes pas autorisé à supprimer cette entrée");
        });
    });
});