const validationController = require('../../../src/modules/validation/validation.controller');
const validationService = require('../../../src/services/validation.service');
const calculationService = require('../../../src/services/calculation.service');
const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../../../src/utils/response.utils');

// Mock dependencies
jest.mock('../../../src/services/validation.service');
jest.mock('../../../src/services/calculation.service');
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        niveaux_sedentarites: {
            findUnique: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

const prisma = new PrismaClient();

describe('Validation Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('checkEmail', () => {
        it('should return available status when email is provided', async () => {
            req.body.email = 'test@example.com';
            validationService.checkEmailAvailability.mockResolvedValue({ available: true });

            await validationController.checkEmail(req, res, next);

            expect(validationService.checkEmailAvailability).toHaveBeenCalledWith('test@example.com');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                data: { available: true }
            }));
        });

        it('should throw error if email is missing', async () => {
            req.body.email = '';

            await validationController.checkEmail(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe("L'email est requis");
        });

        it('should handle service errors', async () => {
            req.body.email = 'test@example.com';
            const error = new Error('Service error');
            validationService.checkEmailAvailability.mockRejectedValue(error);

            await validationController.checkEmail(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('validateProfile', () => {
        it('should return validation result', () => {
            req.body = { firstName: 'John', lastName: 'Doe', email: 'john@example.com', password: 'pass' };
            const mockResult = { isValid: true, errors: {} };
            validationService.validateProfileData.mockReturnValue(mockResult);

            validationController.validateProfile(req, res, next);

            expect(validationService.validateProfileData).toHaveBeenCalledWith('John', 'Doe', 'john@example.com', 'pass');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                data: mockResult
            }));
        });

        it('should handle errors', () => {
            const error = new Error('Validation error');
            validationService.validateProfileData.mockImplementation(() => { throw error; });

            validationController.validateProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('validatePhysical', () => {
        it('should return validation result', () => {
            req.body = { gender: 'H', birthDate: '1990-01-01', weight: 80, height: 180 };
            const mockResult = { isValid: true, errors: {} };
            validationService.validatePhysicalData.mockReturnValue(mockResult);

            validationController.validatePhysical(req, res, next);

            expect(validationService.validatePhysicalData).toHaveBeenCalledWith('H', '1990-01-01', 80, 180);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                data: mockResult
            }));
        });

        it('should handle errors', () => {
            const error = new Error('Validation error');
            validationService.validatePhysicalData.mockImplementation(() => { throw error; });

            validationController.validatePhysical(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('validateTargetWeight', () => {
        beforeEach(() => {
            req.body = {
                currentWeight: 80,
                targetWeight: 75,
                height: 180,
                gender: 'H',
                birthDate: '1990-01-01',
                sedentaryLevelId: 1
            };
        });

        it('should validate target weight and return estimation', async () => {
            calculationService.validateTargetWeight.mockReturnValue({ isValid: true, targetBMI: 23.1, message: 'OK' });
            validationService.calculateAge.mockReturnValue(30);
            prisma.niveaux_sedentarites.findUnique.mockResolvedValue({ valeur: 1.5 });
            calculationService.calculateWeightChangeEstimation.mockReturnValue({ estimatedDays: 30 });

            await validationController.validateTargetWeight(req, res, next);

            expect(calculationService.validateTargetWeight).toHaveBeenCalledWith(75, 180);
            expect(validationService.calculateAge).toHaveBeenCalledWith('1990-01-01');
            expect(prisma.niveaux_sedentarites.findUnique).toHaveBeenCalledWith({ where: { id_niveau_sedentarite: 1 } });
            expect(calculationService.calculateWeightChangeEstimation).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                data: expect.objectContaining({
                    isValid: true,
                    estimation: { estimatedDays: 30 }
                })
            }));
        });

        it('should use default activity factor if sedentary level not found', async () => {
            calculationService.validateTargetWeight.mockReturnValue({ isValid: true });
            prisma.niveaux_sedentarites.findUnique.mockResolvedValue(null);
            calculationService.calculateWeightChangeEstimation.mockReturnValue({});

            await validationController.validateTargetWeight(req, res, next);

            expect(calculationService.calculateWeightChangeEstimation).toHaveBeenCalledWith(
                80, 75, 180, 'H', expect.any(Number), 1.2 // Default factor
            );
        });

        it('should throw error if required data is missing', async () => {
            req.body.currentWeight = null;

            await validationController.validateTargetWeight(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe("Données incomplètes pour la validation");
        });

        it('should handle errors', async () => {
            const error = new Error('Calculation error');
            calculationService.validateTargetWeight.mockImplementation(() => { throw error; });

            await validationController.validateTargetWeight(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
