const dataController = require('../../../src/modules/data/data.controller');
const calculationService = require('../../../src/services/calculation.service');
const { AppError } = require('../../../src/utils/response.utils');

// Mock dependencies
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        niveaux_sedentarites: { findMany: jest.fn() },
        repartitions_nutritionnelles: { findMany: jest.fn() },
        regimes_alimentaires: { findMany: jest.fn() },
        activites: { findMany: jest.fn() },
        preferences: { findFirst: jest.fn() },
        evolutions: { findFirst: jest.fn(), findMany: jest.fn() },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

jest.mock('../../../src/services/calculation.service');

describe('Data Controller', () => {
    let req, res, next;
    let prisma;

    beforeEach(() => {
        req = {
            query: {},
            user: { id_user: 1 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();

        // Access the mocked prisma instance
        const { PrismaClient } = require('@prisma/client');
        prisma = new PrismaClient();
    });

    describe('getSedentaryLevels', () => {
        it('should return sedentary levels', async () => {
            const mockLevels = [{ id: 1, level: 'Low' }];
            prisma.niveaux_sedentarites.findMany.mockResolvedValue(mockLevels);

            await dataController.getSedentaryLevels(req, res, next);

            expect(prisma.niveaux_sedentarites.findMany).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: mockLevels
            }));
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            prisma.niveaux_sedentarites.findMany.mockRejectedValue(error);
            await dataController.getSedentaryLevels(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getNutritionalPlans', () => {
        it('should return nutritional plans', async () => {
            const mockPlans = [{ id: 1, type: 'weight_loss' }];
            prisma.repartitions_nutritionnelles.findMany.mockResolvedValue(mockPlans);

            await dataController.getNutritionalPlans(req, res, next);

            expect(prisma.repartitions_nutritionnelles.findMany).toHaveBeenCalledWith({ where: undefined });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: mockPlans
            }));
        });

        it('should filter by type if provided', async () => {
            req.query.type = 'weight_loss';
            const mockPlans = [{ id: 1, type: 'weight_loss' }];
            prisma.repartitions_nutritionnelles.findMany.mockResolvedValue(mockPlans);

            await dataController.getNutritionalPlans(req, res, next);

            expect(prisma.repartitions_nutritionnelles.findMany).toHaveBeenCalledWith({ where: { type: 'weight_loss' } });
        });
    });

    describe('getDiets', () => {
        it('should return diets', async () => {
            const mockDiets = [{ id: 1, name: 'Vegan' }];
            prisma.regimes_alimentaires.findMany.mockResolvedValue(mockDiets);

            await dataController.getDiets(req, res, next);

            expect(prisma.regimes_alimentaires.findMany).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: mockDiets
            }));
        });
    });

    describe('getActivities', () => {
        it('should return activities', async () => {
            const mockActivities = [{ id: 1, name: 'Running' }];
            prisma.activites.findMany.mockResolvedValue(mockActivities);

            await dataController.getActivities(req, res, next);

            expect(prisma.activites.findMany).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: mockActivities
            }));
        });
    });

    describe('getWeeklySessions', () => {
        it('should return weekly sessions', async () => {
            await dataController.getWeeklySessions(req, res, next);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.any(Array)
            }));
        });
    });

    describe('getUserPreferences', () => {
        it('should return user preferences', async () => {
            const mockPreferences = {
                calories_quotidiennes: 2000,
                repartitions_nutritionnelles: {
                    pourcentage_glucides: 50,
                    pourcentage_proteines: 30,
                    pourcentage_lipides: 20
                },
                tdee: 2500
            };
            const mockEvolution = { poids: 70, taille: 175 };

            prisma.preferences.findFirst.mockResolvedValue(mockPreferences);
            prisma.evolutions.findFirst.mockResolvedValue(mockEvolution);
            calculationService.calculateMacroDistribution.mockReturnValue({ carbs: 250, protein: 150, fat: 44 });

            await dataController.getUserPreferences(req, res, next);

            expect(prisma.preferences.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id_user: 1 } }));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    preferences: mockPreferences,
                    currentWeight: 70,
                    currentHeight: 175,
                    macroDistribution: expect.any(Object),
                    tdee: 2500
                })
            }));
        });

        it('should throw error if preferences not found', async () => {
            prisma.preferences.findFirst.mockResolvedValue(null);
            await dataController.getUserPreferences(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe('Préférences utilisateur non trouvées');
        });
    });

    describe('getUserEvolution', () => {
        it('should return user evolution', async () => {
            const mockEvolutions = [
                { date: new Date(), poids: 70, taille: 175 }
            ];
            prisma.evolutions.findMany.mockResolvedValue(mockEvolutions);
            calculationService.calculateBMI.mockReturnValue(22.9);

            await dataController.getUserEvolution(req, res, next);

            expect(prisma.evolutions.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id_user: 1 } }));
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        weight: 70,
                        height: 175,
                        bmi: '22.9'
                    })
                ])
            }));
        });

        it('should throw error if evolution not found', async () => {
            prisma.evolutions.findMany.mockResolvedValue([]);
            await dataController.getUserEvolution(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe("Données d'évolution non trouvées");
        });
    });
});
