const request = require('supertest');
const app = require('../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

describe('User Routes', () => {
    let token;
    let testUser;

    beforeAll(async () => {
        // Clean up previous test data to ensure idempotency
        await prisma.users.deleteMany({ where: { email: 'user-route-test@example.com' } });
        
        // Create necessary records for preferences
        await prisma.niveaux_sedentarites.upsert({ where: { id_niveau_sedentarite: 1 }, update: {}, create: { id_niveau_sedentarite: 1, nom: 'Sédentaire', valeur: 1.2 } });
        await prisma.niveaux_sedentarites.upsert({ where: { id_niveau_sedentarite: 2 }, update: {}, create: { id_niveau_sedentarite: 2, nom: 'Actif', valeur: 1.55 } });
        await prisma.repartitions_nutritionnelles.upsert({ where: { id_repartition_nutritionnelle: 1 }, update: {}, create: { id_repartition_nutritionnelle: 1, nom: 'Équilibré', description: 'Description', type: 'standard', pourcentage_glucides: 50, pourcentage_proteines: 25, pourcentage_lipides: 25 } });
        await prisma.regimes_alimentaires.upsert({ where: { id_regime_alimentaire: 1 }, update: {}, create: { id_regime_alimentaire: 1, nom: 'Omnivore', description: 'Mange de tout' } });
        await prisma.activites.upsert({ where: { id_activite: 1 }, update: {}, create: { id_activite: 1, nom: 'Course', description: 'Courir' } });
        await prisma.activites.upsert({ where: { id_activite: 2 }, update: {}, create: { id_activite: 2, nom: 'Musculation', description: 'Soulever des poids' } });
        
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

        // Add initial data linked to the user
        await prisma.evolutions.create({
            data: { id_user: testUser.id_user, poids: 70, taille: 175, date: new Date() }
        });
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

        token = jwt.sign({ userId: testUser.id_user, email: testUser.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterAll(async () => {
        // Clean up all created test data
        const user = await prisma.users.findUnique({ where: { email: 'user-route-test@example.com' } });
        if(user) {
            const prefs = await prisma.preferences.findFirst({ where: { id_user: user.id_user }});
            if (prefs) {
                await prisma.preferences_activites.deleteMany({ where: { id_preference: prefs.id_preference } });
                await prisma.preferences.deleteMany({ where: { id_user: user.id_user } });
            }
            await prisma.evolutions.deleteMany({ where: { id_user: user.id_user } });
            await prisma.badges_utilisateurs.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }
        await prisma.$disconnect();
    });

    describe('GET /api/user/profile', () => {
        it('should return user profile', async () => {
            const res = await request(app).get('/api/user/profile').set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.user.email).toBe(testUser.email);
        });
    });

    describe('PUT /api/user/edit-profile', () => {
        it('should update user profile', async () => {
            const res = await request(app).put('/api/user/edit-profile').set('Authorization', `Bearer ${token}`)
                .send({ firstName: 'Updated', lastName: 'User', email: 'user-route-test@example.com', gender: 'F', birthDate: '1995-05-05' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.user.firstName).toBe('Updated');
        });
    });

    describe('GET /api/user/evolution', () => {
        it('should return user evolution data as an object with an array', async () => {
            const res = await request(app).get('/api/user/evolution').set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('evolution');
            expect(Array.isArray(res.body.data.evolution)).toBe(true);
            expect(res.body.data.evolution.length).toBeGreaterThan(0);
        });
    });

    describe('POST /api/user/evolution', () => {
        it('should add a new evolution entry', async () => {
            const res = await request(app).post('/api/user/evolution').set('Authorization', `Bearer ${token}`)
                .send({ weight: 72, height: 175, date: new Date().toISOString() });
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.evolution.weight).toBe(72);
        });
    });

    describe('GET /api/user/badges', () => {
        it('should return unlocked and locked badges', async () => {
            const res = await request(app).get('/api/user/badges').set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('unlockedBadges');
            expect(res.body.data).toHaveProperty('lockedBadges');
        });
    });

    describe('PUT /api/user/edit-preferences', () => {
        it('should update user preferences and recalculate BMR/TDEE', async () => {
            const preferencesData = {
                targetWeight: 68,
                sessionsPerWeek: 5,
                sedentaryLevelId: 2, // Correct field name
                dietId: 1,
                nutritionalPlanId: 1,
                activities: [1, 2]
            };

            const res = await request(app).put('/api/user/edit-preferences').set('Authorization', `Bearer ${token}`).send(preferencesData);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.preferences).toHaveProperty('targetWeight', 68);
            expect(res.body.data.preferences).toHaveProperty('sessionsPerWeek', 5);
            // Check if BMR/TDEE have been updated (they should be different from the initial values)
            expect(res.body.data.preferences.dailyCalories).not.toBe(1800);
        });
    });
    
    describe('GET /api/user/weight-update-status', () => {
        it('should return the weight update status', async () => {
            const res = await request(app).get('/api/user/weight-update-status').set('Authorization', `Bearer ${token}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body.data).toHaveProperty('needsUpdate');
            expect(res.body.data).toHaveProperty('daysSinceLastUpdate');
        });
    });
});