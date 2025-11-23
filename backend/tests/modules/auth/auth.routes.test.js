const request = require('supertest');
const app = require('../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Auth Routes', () => {
    beforeAll(async () => {
        // Clean up before tests
        const user = await prisma.users.findUnique({ where: { email: 'route-test@example.com' } });
        if (user) {
            await prisma.preferences_activites.deleteMany({ where: { preferences: { id_user: user.id_user } } });
            await prisma.preferences.deleteMany({ where: { id_user: user.id_user } });
            await prisma.evolutions.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }
    });

    afterAll(async () => {
        // Clean up after tests
        const user = await prisma.users.findUnique({ where: { email: 'route-test@example.com' } });
        if (user) {
            await prisma.preferences_activites.deleteMany({ where: { preferences: { id_user: user.id_user } } });
            await prisma.preferences.deleteMany({ where: { id_user: user.id_user } });
            await prisma.evolutions.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }
        await prisma.$disconnect();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                firstName: 'Route',
                lastName: 'Test',
                email: 'route-test@example.com',
                password: 'password123',
                birthDate: '1995-05-05',
                gender: 'M',
                weight: 75,
                height: 180,
                targetWeight: 70,
                nutritionalPlanId: 1,
                dietId: 1,
                sedentaryLevelId: 1,
                sessionsPerWeek: 4,
                bmr: 1600,
                tdee: 2200,
                dailyCalories: 2000,
                targetDurationWeeks: 10
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).toHaveProperty('email', userData.email);
        });

        it('should return 409 if email already exists', async () => {
            const userData = {
                firstName: 'Route',
                lastName: 'Test',
                email: 'route-test@example.com',
                password: 'password123',
                birthDate: '1995-05-05',
                gender: 'M',
                weight: 75,
                height: 180,
                targetWeight: 70,
                nutritionalPlanId: 1,
                dietId: 1,
                sedentaryLevelId: 1,
                sessionsPerWeek: 4,
                bmr: 1600,
                tdee: 2200,
                dailyCalories: 2000,
                targetDurationWeeks: 10
            };

            const res = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(res.statusCode).toEqual(409);
            expect(res.body).toHaveProperty('status', 'error');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'route-test@example.com',
                    password: 'password123'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body.data).toHaveProperty('token');
        });

        it('should return 401 with incorrect password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'route-test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toEqual(401);
            expect(res.body).toHaveProperty('status', 'error');
        });
    });
});
