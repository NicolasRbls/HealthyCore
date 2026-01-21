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
        it('should filter foods by type', async () => {
            const recipe = { id_aliment: 1, nom: 'Chicken Soup', type: 'recette', calories: 150, proteines: 10, glucides: 5, lipides: 8, aliments_tags: [], temps_preparation: 30 };
            prisma.aliments.findMany.mockResolvedValue([recipe]);
            prisma.aliments.count.mockResolvedValue(1);

            const result = await NutritionService.getAllFoods({ type: 'recette' });

            expect(prisma.aliments.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { type: 'recette' }
            }));
            expect(result.foods.length).toBe(1);
            expect(result.foods[0].name).toBe('Chicken Soup');
        });
    });

    describe('getFoodById', () => {
        it('should get a food by its ID', async () => {
            const food = { id_aliment: 1, nom: 'Test Food', calories: 100, proteines: 10, glucides: 10, lipides: 2, aliments_tags: [] };
            prisma.aliments.findUnique.mockResolvedValue(food);
            const result = await NutritionService.getFoodById(1);
            expect(result.name).toBe('Test Food');
        });
    });

    describe('getNutritionSummary', () => {
        it('should throw an error if preferences are not defined', async () => {
            prisma.preferences.findFirst.mockResolvedValue(null);
            await expect(NutritionService.getNutritionSummary(1)).rejects.toThrow('Préférences nutritionnelles non définies pour cet utilisateur');
        });
    });

    describe('getTodayNutrition', () => {
        it('should group logged foods by meal and calculate totals', async () => {
            const mockSuivis = [
                { id_suivi_nutritionnel: 1, repas: 'breakfast', quantite: 100, aliments: { id_aliment: 1, nom: 'Apple', type:'produit', calories: 52, proteines: 0.3, glucides: 14, lipides: 0.2 } },
                { id_suivi_nutritionnel: 2, repas: 'lunch', quantite: 200, aliments: { id_aliment: 2, nom: 'Chicken Breast', type:'produit', calories: 165, proteines: 31, glucides: 0, lipides: 3.6 } },
            ];
            prisma.suivis_nutritionnels.findMany.mockResolvedValue(mockSuivis);

            const result = await NutritionService.getTodayNutrition(1);

            expect(result.meals.breakfast.length).toBe(1);
            expect(result.meals.lunch.length).toBe(1);
            expect(result.totals.calories).toBe(382); // 52 + (165 * 2) = 382
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
            prisma.preferences.findFirst.mockResolvedValue(mockPreferences);
            prisma.suivis_nutritionnels.findMany.mockResolvedValue([]);

            const result = await NutritionService.logNutrition(1, logData);

            expect(prisma.suivis_nutritionnels.create).toHaveBeenCalled();
            expect(result).toHaveProperty('nutritionEntry');
        });
    });

    describe('deleteNutritionEntry', () => {
        it('should throw an error if entry does not exist', async () => {
            prisma.suivis_nutritionnels.findUnique.mockResolvedValue(null);
            await expect(NutritionService.deleteNutritionEntry(1, 999)).rejects.toThrow("Entrée non trouvée");
        });
    });

    describe('getNutritionHistory', () => {
        it('should return a formatted history of nutrition logs', async () => {
            const mockSuivis = [
                { date: new Date('2024-01-15'), quantite: 100, aliments: { type: 'produit', calories: 200 } },
                { date: new Date('2024-01-14'), quantite: 150, aliments: { type: 'produit', calories: 150 } },
            ];
            const mockPreferences = { calories_quotidiennes: 2000 };

            prisma.suivis_nutritionnels.findMany.mockResolvedValue(mockSuivis);
            prisma.preferences.findFirst.mockResolvedValue(mockPreferences);

            const result = await NutritionService.getNutritionHistory(1, {});

            expect(result.history.length).toBe(2);
            expect(result.history[0].date).toBe('2024-01-15');
            expect(result.history[0].calories).toBe(200); // 200 * 100 / 100
            expect(result.history[1].date).toBe('2024-01-14');
            expect(result.history[1].calories).toBe(225); // 150 * 150 / 100
            expect(result.summary.totalDays).toBe(2);
        });
    });
});
