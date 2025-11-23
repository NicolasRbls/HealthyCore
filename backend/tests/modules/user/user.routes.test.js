const request = require('supertest');
const app = require('../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

describe('User Routes', () => {
    let token;
    let testUser;

    beforeAll(async () => {
        // Clean up
        const user = await prisma.users.findUnique({ where: { email: 'user-route-test@example.com' } });
        if (user) {
            await prisma.preferences_activites.deleteMany({ where: { preferences: { id_user: user.id_user } } });
            await prisma.preferences.deleteMany({ where: { id_user: user.id_user } });
            await prisma.evolutions.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }

        // Create test user
        testUser = await prisma.users.create({
            data: {
                prenom: 'Route',
                nom: 'Test',
                email: 'user-route-test@example.com',
                mot_de_passe: 'password123',
                sexe: 'M',
                date_de_naissance: new Date('1990-01-01'),
                role: 'user'
            }
        });

        // Add initial evolution
        await prisma.evolutions.create({
            data: {
                id_user: testUser.id_user,
                poids: 70,
                taille: 175,
                date: new Date()
            }
        });

        // Add preferences
        await prisma.preferences.create({
            data: {
                id_user: testUser.id_user,
                objectif_poids: 65,
                id_niveau_sedentarite: 1,
                id_repartition_nutritionnelle: 1,
                id_regime_alimentaire: 1,
                seances_par_semaines: 3,
                bmr: 1500,
                tdee: 2000,
                calories_quotidiennes: 1800
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
            await prisma.preferences_activites.deleteMany({ where: { preferences: { id_user: testUser.id_user } } });
            await prisma.preferences.deleteMany({ where: { id_user: testUser.id_user } });
            await prisma.evolutions.deleteMany({ where: { id_user: testUser.id_user } });
            await prisma.users.delete({ where: { id_user: testUser.id_user } });
        }
        await prisma.$disconnect();
    });

    describe('GET /api/user/profile', () => {
        it('should return user profile', async () => {
            const res = await request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('status', 'success');
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data.user).toHaveProperty('email', testUser.email);
        });

        it('should return 401 if no token provided', async () => {
            const res = await request(app).get('/api/user/profile');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('PUT /api/user/edit-profile', () => {
        it('should update user profile', async () => {
            const updateData = {
                firstName: 'UpdatedRoute',
                lastName: 'Test',
                email: 'user-route-test@example.com',
                gender: 'F',
                birthDate: '1995-05-05'
            };

            const res = await request(app)
                .put('/api/user/edit-profile')
                .set('Authorization', `Bearer ${token}`)
                .send(updateData);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.user).toHaveProperty('firstName', 'UpdatedRoute');
            expect(res.body.data.user).toHaveProperty('gender', 'F');
        });
    });
});
