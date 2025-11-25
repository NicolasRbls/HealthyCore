const request = require('supertest');
const app = require('../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

describe('Signalement Routes', () => {
    let token;
    let adminToken;
    let testUser;
    let testAdmin;
    let testFood;
    let testSignalementType;

    beforeAll(async () => {
        // Clean up
        const user = await prisma.users.findUnique({ where: { email: 'signalement-route-test@example.com' } });
        if (user) {
            await prisma.signalements_utilisateurs.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }
        const admin = await prisma.users.findUnique({ where: { email: 'admin-signalement-test@example.com' } });
        if (admin) {
            await prisma.signalements_utilisateurs.deleteMany({ where: { id_user: admin.id_user } });
            await prisma.users.delete({ where: { id_user: admin.id_user } });
        }

        const food = await prisma.aliments.findFirst({ where: { nom: 'Signalement Route Test Apple' } });
        if (food) {
            await prisma.signalements_utilisateurs.deleteMany({ where: { id_aliment: food.id_aliment } });
            await prisma.aliments.delete({ where: { id_aliment: food.id_aliment } });
        }

        // Create test user
        testUser = await prisma.users.create({
            data: {
                prenom: 'SignalementRoute',
                nom: 'Test',
                email: 'signalement-route-test@example.com',
                mot_de_passe: 'password123',
                sexe: 'M',
                date_de_naissance: new Date('1990-01-01'),
                role: 'user'
            }
        });

        // Create test admin
        testAdmin = await prisma.users.create({
            data: {
                prenom: 'AdminSignalement',
                nom: 'Test',
                email: 'admin-signalement-test@example.com',
                mot_de_passe: 'password123',
                sexe: 'M',
                date_de_naissance: new Date('1990-01-01'),
                role: 'admin'
            }
        });

        // Create test food
        testFood = await prisma.aliments.create({
            data: {
                nom: 'Signalement Route Test Apple',
                calories: 52,
                proteines: 0.3,
                glucides: 14,
                lipides: 0.2,
                type: 'produit',
                source: 'user',
                temps_preparation: 0
            }
        });

        // Get or create signalement type
        testSignalementType = await prisma.signalements.findFirst();
        if (!testSignalementType) {
            testSignalementType = await prisma.signalements.create({
                data: {
                    titre: 'Erreur nutritionnelle'
                }
            });
        }

        // Generate tokens
        token = jwt.sign(
            { userId: testUser.id_user, email: testUser.email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        adminToken = jwt.sign(
            { userId: testAdmin.id_user, email: testAdmin.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
    });

    afterAll(async () => {
        if (testUser) {
            await prisma.signalements_utilisateurs.deleteMany({ where: { id_user: testUser.id_user } });
            await prisma.users.delete({ where: { id_user: testUser.id_user } });
        }
        if (testAdmin) {
            await prisma.signalements_utilisateurs.deleteMany({ where: { id_user: testAdmin.id_user } });
            await prisma.users.delete({ where: { id_user: testAdmin.id_user } });
        }
        if (testFood) {
            await prisma.aliments.delete({ where: { id_aliment: testFood.id_aliment } });
        }
        await prisma.$disconnect();
    });

    describe('POST /api/signalements', () => {
        it('should create a new signalement', async () => {
            const data = {
                id_signalement: testSignalementType.id_signalement,
                id_aliment: testFood.id_aliment,
                description: 'Wrong calories'
            };

            const res = await request(app)
                .post('/api/signalements')
                .set('Authorization', `Bearer ${token}`)
                .send(data);

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('id_signalement_utilisateur');
        });
    });

    describe('GET /api/signalements/types', () => {
        it('should return signalement types', async () => {
            const res = await request(app)
                .get('/api/signalements/types')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/signalements (Admin)', () => {
        it('should return all signalements for admin', async () => {
            const res = await request(app)
                .get('/api/signalements')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should return 403 for non-admin', async () => {
            const res = await request(app)
                .get('/api/signalements')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(403);
        });
    });
});
