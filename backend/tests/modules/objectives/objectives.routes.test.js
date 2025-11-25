const request = require('supertest');
const app = require('../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

describe('Objectives Routes', () => {
    let token;
    let testUser;
    let testObjective;

    beforeAll(async () => {
        // Clean up
        const user = await prisma.users.findUnique({ where: { email: 'objectives-test@example.com' } });
        if (user) {
            await prisma.objectifs_utilisateurs.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }

        // Ensure at least one objective exists
        testObjective = await prisma.objectifs.findFirst({ where: { titre: 'Test Objective' } });
        if (!testObjective) {
            testObjective = await prisma.objectifs.create({
                data: {
                    titre: 'Test Objective'
                }
            });
        }

        // Create test user
        testUser = await prisma.users.create({
            data: {
                prenom: 'Objective',
                nom: 'Test',
                email: 'objectives-test@example.com',
                mot_de_passe: 'password123',
                sexe: 'M',
                date_de_naissance: new Date('1990-01-01'),
                role: 'user'
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
            await prisma.objectifs_utilisateurs.deleteMany({ where: { id_user: testUser.id_user } });
            await prisma.users.delete({ where: { id_user: testUser.id_user } });
        }
        if (testObjective) {
            // Check if other users are using this objective before deleting (optional, but good practice)
            // For simplicity in test env, we might leave it or delete it if we created it.
            // Here we assume we created it if it was missing.
            await prisma.objectifs.delete({ where: { id_objectif: testObjective.id_objectif } });
        }
        await prisma.$disconnect();
    });

    describe('GET /api/objectives/daily', () => {
        it('should return daily objectives', async () => {
            const res = await request(app)
                .get('/api/objectives/daily')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('objectives');
            expect(Array.isArray(res.body.data.objectives)).toBe(true);
            expect(res.body.data.objectives.length).toBeGreaterThan(0);
        });
    });

    describe('PUT /api/objectives/:objectiveId/complete', () => {
        it('should mark objective as completed', async () => {
            // First get objectives to find the user objective ID
            const dailyRes = await request(app)
                .get('/api/objectives/daily')
                .set('Authorization', `Bearer ${token}`);

            const userObjectiveId = dailyRes.body.data.objectives[0].id;

            const res = await request(app)
                .put(`/api/objectives/${userObjectiveId}/complete`)
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.objective.completed).toBe(true);
        });
    });
});
