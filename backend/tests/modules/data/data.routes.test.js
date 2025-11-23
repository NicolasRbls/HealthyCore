const request = require('supertest');
const app = require('../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

describe('Data Routes', () => {
    let token;
    let testUser;

    beforeAll(async () => {
        // Clean up
        const user = await prisma.users.findUnique({ where: { email: 'data-test@example.com' } });
        if (user) {
            await prisma.evolutions.deleteMany({ where: { id_user: user.id_user } });
            await prisma.preferences.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }

        // Ensure static data exists (simplified check)
        const level = await prisma.niveaux_sedentarites.findFirst();
        if (!level) {
            await prisma.niveaux_sedentarites.create({
                data: {
                    niveau: 'Faible',
                    facteur: 1.2,
                    description: 'Peu d\'exercice'
                }
            });
        }

        // Create test user
        testUser = await prisma.users.create({
            data: {
                prenom: 'Data',
                nom: 'Test',
                email: 'data-test@example.com',
                mot_de_passe: 'password123',
                sexe: 'M',
                date_de_naissance: new Date('1990-01-01'),
                role: 'user'
            }
        });

        // Create test evolution
        await prisma.evolutions.create({
            data: {
                id_user: testUser.id_user,
                poids: 75,
                taille: 180,
                date: new Date()
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
            await prisma.evolutions.deleteMany({ where: { id_user: testUser.id_user } });
            await prisma.preferences.deleteMany({ where: { id_user: testUser.id_user } });
            await prisma.users.delete({ where: { id_user: testUser.id_user } });
        }
        await prisma.$disconnect();
    });

    describe('Public Routes', () => {
        it('GET /api/data/sedentary-levels should return levels', async () => {
            const res = await request(app).get('/api/data/sedentary-levels');
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/data/nutritional-plans should return plans', async () => {
            const res = await request(app).get('/api/data/nutritional-plans');
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/data/diets should return diets', async () => {
            const res = await request(app).get('/api/data/diets');
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/data/activities should return activities', async () => {
            const res = await request(app).get('/api/data/activities');
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('GET /api/data/weekly-sessions should return sessions', async () => {
            const res = await request(app).get('/api/data/weekly-sessions');
            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('Protected Routes', () => {
        it('GET /api/data/user-evolution should return evolution history', async () => {
            const res = await request(app)
                .get('/api/data/user-evolution')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });
});
