const userService = require('../../../src/modules/user/user.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('User Service', () => {
    let testUser;

    beforeAll(async () => {
        // Clean up before tests
        const user = await prisma.users.findUnique({ where: { email: 'user-service-test@example.com' } });
        if (user) {
            await prisma.preferences_activites.deleteMany({ where: { preferences: { id_user: user.id_user } } });
            await prisma.preferences.deleteMany({ where: { id_user: user.id_user } });
            await prisma.evolutions.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }

        // Create a test user
        testUser = await prisma.users.create({
            data: {
                prenom: 'User',
                nom: 'Service Test',
                email: 'user-service-test@example.com',
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
    });

    afterAll(async () => {
        // Clean up after tests
        if (testUser) {
            await prisma.preferences_activites.deleteMany({ where: { preferences: { id_user: testUser.id_user } } });
            await prisma.preferences.deleteMany({ where: { id_user: testUser.id_user } });
            await prisma.evolutions.deleteMany({ where: { id_user: testUser.id_user } });
            await prisma.users.delete({ where: { id_user: testUser.id_user } });
        }
        await prisma.$disconnect();
    });

    describe('getUserProfile', () => {
        it('should return user profile with metrics and preferences', async () => {
            const profile = await userService.getUserProfile(testUser.id_user);

            expect(profile).toHaveProperty('user');
            expect(profile.user).toHaveProperty('email', testUser.email);
            expect(profile).toHaveProperty('metrics');
            expect(profile.metrics).toHaveProperty('currentWeight', 70);
            expect(profile).toHaveProperty('preferences');
            expect(profile.preferences).toHaveProperty('nutritionalPlan');
        });

        it('should throw error if user not found', async () => {
            await expect(userService.getUserProfile(99999)).rejects.toThrow('Utilisateur introuvable');
        });
    });

    describe('updateUserProfile', () => {
        it('should update user profile successfully', async () => {
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name',
                email: 'user-service-test@example.com',
                gender: 'F',
                birthDate: '1995-05-05'
            };

            const updatedProfile = await userService.updateUserProfile(testUser.id_user, updateData);

            expect(updatedProfile).toHaveProperty('firstName', 'Updated');
            expect(updatedProfile).toHaveProperty('gender', 'F');

            // Verify in DB
            const userInDb = await prisma.users.findUnique({ where: { id_user: testUser.id_user } });
            expect(userInDb.prenom).toBe('Updated');
        });
    });

    describe('addEvolution', () => {
        it('should add a new evolution entry', async () => {
            const evolutionData = {
                weight: 72,
                height: 175,
                date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
            };

            const result = await userService.addEvolution(testUser.id_user, evolutionData);

            expect(result).toHaveProperty('weight', 72);
            expect(result).toHaveProperty('bmi');

            // Verify in DB
            const evolutions = await prisma.evolutions.findMany({
                where: { id_user: testUser.id_user },
                orderBy: { date: 'desc' }
            });
            expect(parseFloat(evolutions[0].poids)).toBe(72);
        });
    });
});
