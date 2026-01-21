const authService = require('../../../src/modules/auth/auth.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe('Auth Service', () => {
    let testUser;

    beforeAll(async () => {
        // Clean up before tests
        const user = await prisma.users.findUnique({ where: { email: 'test@example.com' } });
        if (user) {
            await prisma.preferences_activites.deleteMany({ where: { preferences: { id_user: user.id_user } } });
            await prisma.preferences.deleteMany({ where: { id_user: user.id_user } });
            await prisma.evolutions.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }
    });

    afterAll(async () => {
        // Clean up after tests
        const user = await prisma.users.findUnique({ where: { email: 'test@example.com' } });
        if (user) {
            await prisma.preferences_activites.deleteMany({ where: { preferences: { id_user: user.id_user } } });
            await prisma.preferences.deleteMany({ where: { id_user: user.id_user } });
            await prisma.evolutions.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }
        await prisma.$disconnect();
    });

    describe('register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                nom: 'Test',
                prenom: 'User',
                email: 'test@example.com',
                password: 'password123', // Changed from mot_de_passe to password to match service expectation
                firstName: 'User', // Added to match service expectation
                lastName: 'Test', // Added to match service expectation
                birthDate: '1990-01-01', // Added to match service expectation
                gender: 'M', // Changed to match VarChar(2)
                weight: 70, // Added to match service expectation
                height: 175, // Added to match service expectation
                targetWeight: 65, // Added to match service expectation
                nutritionalPlanId: 1, // Added to match service expectation
                dietId: 1, // Added to match service expectation
                sedentaryLevelId: 1, // Added to match service expectation
                sessionsPerWeek: 3, // Added to match service expectation
                bmr: 1500, // Added to match service expectation
                tdee: 2000, // Added to match service expectation
                dailyCalories: 1800, // Added to match service expectation
                targetDurationWeeks: 12 // Added to match service expectation
            };

            const result = await authService.registerUser(userData);

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token');
            expect(result.user.email).toBe(userData.email);

            testUser = result.user;
        });

        it('should throw error if email already exists', async () => {
            const userData = {
                email: 'test@example.com',
                password: 'password123',
                firstName: 'User',
                lastName: 'Test',
                birthDate: '1990-01-01',
                gender: 'M',
                weight: 70,
                height: 175,
                targetWeight: 65,
                nutritionalPlanId: 1,
                dietId: 1,
                sedentaryLevelId: 1,
                sessionsPerWeek: 3,
                bmr: 1500,
                tdee: 2000,
                dailyCalories: 1800,
                targetDurationWeeks: 12
            };

            await expect(authService.registerUser(userData)).rejects.toThrow('Cette adresse email est déjà utilisée');
        });
    });

    describe('login', () => {
        it('should login successfully with correct credentials', async () => {
            const result = await authService.loginUser('test@example.com', 'password123');

            expect(result).toHaveProperty('user');
            expect(result).toHaveProperty('token');
            expect(result.user.email).toBe('test@example.com');
        });

        it('should throw error with incorrect password', async () => {
            await expect(authService.loginUser('test@example.com', 'wrongpassword')).rejects.toThrow('Email ou mot de passe incorrect');
        });

        it('should throw error with non-existent email', async () => {
            await expect(authService.loginUser('nonexistent@example.com', 'password123')).rejects.toThrow('Email ou mot de passe incorrect');
        });
    });
});
