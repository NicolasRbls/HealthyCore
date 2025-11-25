const NutritionController = require('../../../src/modules/nutrition/nutrition.controller');
const NutritionService = require('../../../src/modules/nutrition/nutrition.service');
const { AppError } = require('../../../src/utils/response.utils');

// Mock dependencies
jest.mock('../../../src/modules/nutrition/nutrition.service');

describe('Nutrition Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {},
            user: { id_user: 1 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getAllFoods', () => {
        it('should return all foods with pagination', async () => {
            const mockData = { foods: [], total: 0, totalPages: 0 };
            NutritionService.getAllFoods.mockResolvedValue(mockData);

            await NutritionController.getAllFoods(req, res, next);

            expect(NutritionService.getAllFoods).toHaveBeenCalledWith({
                page: 1,
                limit: 20,
                search: "",
                type: null,
                tagId: null,
                source: null,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                data: expect.objectContaining({
                    foods: [],
                    pagination: expect.any(Object)
                })
            }));
        });

        it('should throw error for invalid type', async () => {
            req.query.type = 'invalid';
            await NutritionController.getAllFoods(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toContain('Type invalide');
        });

        it('should throw error for invalid source', async () => {
            req.query.source = 'invalid';
            await NutritionController.getAllFoods(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toContain('Source invalide');
        });
    });

    describe('getFoodById', () => {
        it('should return food by id', async () => {
            req.params.id = '123';
            const mockFood = { id: 123, name: 'Apple' };
            NutritionService.getFoodById.mockResolvedValue(mockFood);

            await NutritionController.getFoodById(req, res, next);

            expect(NutritionService.getFoodById).toHaveBeenCalledWith(123);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: mockFood
            }));
        });

        it('should throw error if id is missing', async () => {
            req.params.id = undefined;
            await NutritionController.getFoodById(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('getNutritionSummary', () => {
        it('should return nutrition summary', async () => {
            const mockSummary = { calories: 2000 };
            NutritionService.getNutritionSummary.mockResolvedValue(mockSummary);

            await NutritionController.getNutritionSummary(req, res, next);

            expect(NutritionService.getNutritionSummary).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: mockSummary
            }));
        });
    });

    describe('getTodayNutrition', () => {
        it('should return today nutrition', async () => {
            const mockData = { meals: [] };
            NutritionService.getTodayNutrition.mockResolvedValue(mockData);

            await NutritionController.getTodayNutrition(req, res, next);

            expect(NutritionService.getTodayNutrition).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: mockData
            }));
        });
    });

    describe('logNutrition', () => {
        it('should log nutrition entry', async () => {
            req.body = { foodId: 1, quantity: 100, meal: 'lunch' };
            const mockEntry = { id: 1, ...req.body };
            NutritionService.logNutrition.mockResolvedValue(mockEntry);

            await NutritionController.logNutrition(req, res, next);

            expect(NutritionService.logNutrition).toHaveBeenCalledWith(1, {
                foodId: 1,
                quantity: 100,
                meal: 'lunch',
                date: undefined
            });
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should throw error if fields are missing', async () => {
            req.body = { foodId: 1 }; // Missing quantity and meal
            await NutritionController.logNutrition(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('deleteNutritionEntry', () => {
        it('should delete nutrition entry', async () => {
            req.params.entryId = '123';
            NutritionService.deleteNutritionEntry.mockResolvedValue();

            await NutritionController.deleteNutritionEntry(req, res, next);

            expect(NutritionService.deleteNutritionEntry).toHaveBeenCalledWith(1, 123);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should throw error if entryId is missing', async () => {
            req.params.entryId = undefined;
            await NutritionController.deleteNutritionEntry(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
        });
    });

    describe('getNutritionHistory', () => {
        it('should return nutrition history', async () => {
            req.query = { startDate: '2023-01-01', endDate: '2023-01-31' };
            const mockHistory = [];
            NutritionService.getNutritionHistory.mockResolvedValue(mockHistory);

            await NutritionController.getNutritionHistory(req, res, next);

            expect(NutritionService.getNutritionHistory).toHaveBeenCalledWith(1, {
                startDate: '2023-01-01',
                endDate: '2023-01-31'
            });
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
