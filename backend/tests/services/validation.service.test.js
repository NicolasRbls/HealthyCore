const validationService = require('../../src/services/validation.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mock Prisma
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        users: {
            findFirst: jest.fn(),
        },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

describe('Validation Service', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('checkEmailAvailability', () => {
        it('should return available: true if user does not exist', async () => {
            prisma.users.findFirst.mockResolvedValue(null);
            const result = await validationService.checkEmailAvailability('new@example.com');
            expect(result).toEqual({ available: true });
            expect(prisma.users.findFirst).toHaveBeenCalledWith({
                where: {
                    email: {
                        equals: 'new@example.com',
                        mode: 'insensitive',
                    },
                },
            });
        });

        it('should return available: false if user exists', async () => {
            prisma.users.findFirst.mockResolvedValue({ id_user: 1, email: 'existing@example.com' });
            const result = await validationService.checkEmailAvailability('existing@example.com');
            expect(result).toEqual({ available: false });
        });

        it('should throw error if prisma fails', async () => {
            const error = new Error('Database error');
            prisma.users.findFirst.mockRejectedValue(error);
            await expect(validationService.checkEmailAvailability('test@example.com')).rejects.toThrow('Database error');
        });
    });

    describe('validateProfileData', () => {
        it('should return valid for correct data', () => {
            const result = validationService.validateProfileData('John', 'Doe', 'john@example.com', 'password123');
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual({});
        });

        it('should return invalid for incorrect first name', () => {
            const result = validationService.validateProfileData('John123', 'Doe', 'john@example.com', 'password123');
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveProperty('firstName');
        });

        it('should return invalid for incorrect last name', () => {
            const result = validationService.validateProfileData('John', 'Doe!', 'john@example.com', 'password123');
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveProperty('lastName');
        });

        it('should return invalid for incorrect email', () => {
            const result = validationService.validateProfileData('John', 'Doe', 'invalid-email', 'password123');
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveProperty('email');
        });

        it('should return invalid for short password', () => {
            const result = validationService.validateProfileData('John', 'Doe', 'john@example.com', 'short');
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveProperty('password');
        });
    });

    describe('validatePhysicalData', () => {
        it('should return valid for correct data', () => {
            // 20 years old
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 20);

            const result = validationService.validatePhysicalData('H', birthDate.toISOString(), 75, 180);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual({});
        });

        it('should return invalid for incorrect gender', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 20);

            const result = validationService.validatePhysicalData('X', birthDate.toISOString(), 75, 180);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveProperty('gender');
        });

        it('should return invalid for too young age (< 13)', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 10);

            const result = validationService.validatePhysicalData('H', birthDate.toISOString(), 75, 180);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveProperty('birthDate');
        });

        it('should return invalid for invalid weight', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 20);

            const result = validationService.validatePhysicalData('H', birthDate.toISOString(), -5, 180);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveProperty('weight');
        });

        it('should return invalid for invalid height', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 20);

            const result = validationService.validatePhysicalData('H', birthDate.toISOString(), 75, 350);
            expect(result.isValid).toBe(false);
            expect(result.errors).toHaveProperty('height');
        });
    });

    describe('calculateAge', () => {
        it('should calculate age correctly', () => {
            const today = new Date();
            const birthDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate());
            const age = validationService.calculateAge(birthDate);
            expect(age).toBe(20);
        });

        it('should calculate age correctly before birthday', () => {
            const today = new Date();
            // Birthday is tomorrow, so age should be 19
            const birthDate = new Date(today.getFullYear() - 20, today.getMonth(), today.getDate() + 1);
            const age = validationService.calculateAge(birthDate);
            expect(age).toBe(19);
        });
    });
});
