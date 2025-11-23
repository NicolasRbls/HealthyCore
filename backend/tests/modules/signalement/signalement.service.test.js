const signalementService = require('../../../src/modules/signalement/signalement.service');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

describe('Signalement Service', () => {
    let testUser;
    let testFood;
    let testSignalementType;

    beforeAll(async () => {
        // Clean up
        const user = await prisma.users.findUnique({ where: { email: 'signalement-service-test@example.com' } });
        if (user) {
            await prisma.signalements_utilisateurs.deleteMany({ where: { id_user: user.id_user } });
            await prisma.users.delete({ where: { id_user: user.id_user } });
        }

        const food = await prisma.aliments.findFirst({ where: { nom: 'Signalement Test Apple' } });
        if (food) {
            await prisma.signalements_utilisateurs.deleteMany({ where: { id_aliment: food.id_aliment } });
            await prisma.aliments.delete({ where: { id_aliment: food.id_aliment } });
        }

        // Create test user
        testUser = await prisma.users.create({
            data: {
                prenom: 'Signalement',
                nom: 'Test',
                email: 'signalement-service-test@example.com',
                mot_de_passe: 'password123',
                sexe: 'M',
                date_de_naissance: new Date('1990-01-01'),
                role: 'user'
            }
        });

        // Create test food
        testFood = await prisma.aliments.create({
            data: {
                nom: 'Signalement Test Apple',
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
    });

    afterAll(async () => {
        if (testUser) {
            await prisma.signalements_utilisateurs.deleteMany({ where: { id_user: testUser.id_user } });
            await prisma.users.delete({ where: { id_user: testUser.id_user } });
        }
        if (testFood) {
            await prisma.aliments.delete({ where: { id_aliment: testFood.id_aliment } });
        }
        await prisma.$disconnect();
    });

    describe('createSignalement', () => {
        it('should create a new signalement', async () => {
            const data = {
                id_signalement: testSignalementType.id_signalement,
                id_aliment: testFood.id_aliment,
                description: 'Wrong calories'
            };

            const result = await signalementService.createSignalement(testUser.id_user, data);

            expect(result).toHaveProperty('id_signalement_utilisateur');
            expect(result).toHaveProperty('description', 'Wrong calories');
            expect(result).toHaveProperty('statut', 'non_revue');
        });

        it('should throw error if food not found', async () => {
            const data = {
                id_signalement: testSignalementType.id_signalement,
                id_aliment: 99999,
                description: 'Wrong calories'
            };

            await expect(signalementService.createSignalement(testUser.id_user, data)).rejects.toThrow('Aliment not found');
        });
    });

    describe('getAllSignalements', () => {
        it('should return all signalements', async () => {
            const result = await signalementService.getAllSignalements();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });
    });

    describe('getSignalementTypes', () => {
        it('should return all signalement types', async () => {
            const result = await signalementService.getSignalementTypes();
            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });
    });
});
