// backend/tests/modules/user/user.service.test.js

const { PrismaClient } = require('@prisma/client');
const userService = require('../../../src/modules/user/user.service');
const { AppError } = require('../../../src/utils/response.utils');

// Mock the Prisma client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        users: { findUnique: jest.fn(), update: jest.fn(), findFirst: jest.fn() },
        evolutions: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn() },
        preferences: { findFirst: jest.fn(), update: jest.fn() },
        repartitions_nutritionnelles: { findUnique: jest.fn() },
        niveaux_sedentarites: { findUnique: jest.fn() },
        badges: { findMany: jest.fn() },
        badges_utilisateurs: { findMany: jest.fn(), create: jest.fn() },
        suivis_sportifs: { findFirst: jest.fn(), findMany: jest.fn() },
        suivis_nutritionnels: { findFirst: jest.fn(), findMany: jest.fn() },
        objectifs: { count: jest.fn() },
        objectifs_utilisateurs: { findMany: jest.fn(), count: jest.fn() },
        activites: { findMany: jest.fn() },
        preferences_activites: { deleteMany: jest.fn(), createMany: jest.fn() },
        regimes_alimentaires: { findUnique: jest.fn() },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

let prisma;

describe('User Service', () => {

    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2024-01-01T10:00:00Z'));
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        prisma = new PrismaClient();
        jest.clearAllMocks();
    });

    describe('getUserProfile', () => {
        it('should return a fully populated user profile', async () => {
            const mockUser = { id_user: 1, prenom: 'John', nom: 'Doe', email: 'john@test.com', sexe: 'M', date_de_naissance: new Date('1990-01-01') };
            const mockLastEvolution = { poids: 80, taille: 180 };
            const mockPreferences = {
                objectif_poids: 75,
                calories_quotidiennes: 2500,
                seances_par_semaines: 4,
                repartitions_nutritionnelles: { id_repartition_nutritionnelle: 1, nom: 'Plan A', type: 'typeA' },
                regimes_alimentaires: { id_regime_alimentaire: 1, nom: 'Diet A' },
                niveaux_sedentarites: { id_niveau_sedentarite: 1, nom: 'Level A' },
                preferences_activites: []
            };

            prisma.users.findUnique.mockResolvedValue(mockUser);
            prisma.evolutions.findFirst.mockResolvedValue(mockLastEvolution);
            prisma.preferences.findFirst.mockResolvedValue(mockPreferences);

            const profile = await userService.getUserProfile(1);

            expect(profile.user.firstName).toBe('John');
            expect(profile.user.age).toBe(34); // Born in 1990, test is in 2024
            expect(profile.metrics.currentWeight).toBe(80);
            expect(profile.metrics.bmi).toBe(24.7);
            expect(profile.preferences.diet.name).toBe('Diet A');
        });

        it('should throw an error if user is not found', async () => {
            prisma.users.findUnique.mockResolvedValue(null);
            await expect(userService.getUserProfile(999)).rejects.toThrow('Utilisateur introuvable');
        });
    });

    describe('updatePreferences', () => {
        it('should update preferences and correctly recalculate BMR, TDEE, and daily calories', async () => {
            // 1. Setup Mock Data
            const userId = 1;
            const body = {
                targetWeight: 75,
                sedentaryLevelId: 2,
                nutritionalPlanId: 1,
                dietId: 1,
                sessionsPerWeek: 5,
                activities: [],
            };

            const mockUser = {
                id_user: userId,
                sexe: 'H',
                date_de_naissance: new Date('1990-01-01'), // Age will be 34
            };

            const mockLastEvolution = {
                poids: 80,
                taille: 180,
            };

            const mockNutritionPlan = {
                id_repartition_nutritionnelle: 1,
                nom: 'Prise de masse',
                pourcentage_proteines: 30,
                pourcentage_glucides: 50,
                pourcentage_lipides: 20,
            };

            const mockSedentaryLevel = {
                id_niveau_sedentarite: 2,
                valeur: 1.55,
            };

            const mockExistingPreferences = {
                id_preference: 10,
                id_user: userId,
            };

            // 2. Mock Prisma Calls
            prisma.preferences.findFirst.mockResolvedValue(mockExistingPreferences);
            prisma.preferences.update.mockResolvedValue(mockExistingPreferences);
            prisma.users.findUnique.mockResolvedValue(mockUser);
            prisma.repartitions_nutritionnelles.findUnique.mockResolvedValue(mockNutritionPlan);
            prisma.niveaux_sedentarites.findUnique.mockResolvedValue(mockSedentaryLevel);
            prisma.evolutions.findFirst.mockResolvedValue(mockLastEvolution);

            // Mock the diet and activities lookups
            prisma.regimes_alimentaires = { findUnique: jest.fn().mockResolvedValue({ id_regime_alimentaire: 1, nom: 'Omnivore' }) };
            prisma.activites = { findMany: jest.fn().mockResolvedValue([]) };
            prisma.preferences_activites = { deleteMany: jest.fn(), createMany: jest.fn() };


            // 3. Call the service function
            const result = await userService.updatePreferences(userId, body);

            // 4. Assertions
            // BMR = 10 * 80 + 6.25 * 180 - 5 * 34 + 5 = 800 + 1125 - 170 + 5 = 1760
            // TDEE (dailyCalories) = 1760 * 1.55 = 2728
            // Proteins = (0.30 * 2728) / 4 = 204.6 -> 205
            // Carbs = (0.50 * 2728) / 4 = 341
            // Fats = (0.20 * 2728) / 9 = 60.6 -> 61
            expect(result.dailyCalories).toBe(2728);
            expect(result.macros.proteins).toBe(205);
            expect(result.macros.carbs).toBe(341);
            expect(result.macros.fats).toBe(61);
        });
    });

    describe('getUserBadges', () => {
        it('should correctly partition unlocked and locked badges', async () => {
            const allBadges = [
                { id_badge: 1, nom: 'Badge 1', condition_obtention: 'COND_1' },
                { id_badge: 2, nom: 'Badge 2', condition_obtention: 'COND_2' },
            ];
            const unlockedUserBadges = [
                { id_badge: 1, badges: allBadges[0] }
            ];

            prisma.badges.findMany.mockResolvedValue(allBadges);
            prisma.badges_utilisateurs.findMany.mockResolvedValue(unlockedUserBadges);

            const result = await userService.getUserBadges(1);

            expect(result.unlockedBadges.length).toBe(1);
            expect(result.unlockedBadges[0].name).toBe('Badge 1');
            expect(result.lockedBadges.length).toBe(1);
            expect(result.lockedBadges[0].name).toBe('Badge 2');
        });
    });

    describe('checkNewBadges', () => {
        it('should award a new badge if conditions are met', async () => {
            const badgeToDo = { id_badge: 1, nom: 'First Session', condition_obtention: 'DO_FIRST_SESSION' };

            // User has no badges yet
            prisma.badges_utilisateurs.findMany.mockResolvedValue([]);
            // This is the only badge available
            prisma.badges.findMany.mockResolvedValue([badgeToDo]);
            // Mock the condition handler: user has completed a session
            prisma.suivis_sportifs.findFirst.mockResolvedValue({ id: 99 });

            const newBadges = await userService.checkNewBadges(1);

            expect(newBadges.length).toBe(1);
            expect(newBadges[0].name).toBe('First Session');
            expect(prisma.badges_utilisateurs.create).toHaveBeenCalledWith({
                data: { id_user: 1, id_badge: 1 }
            });
        });

        it('should not award a badge if user already has it', async () => {
            const badgeDone = { id_badge: 1, nom: 'First Session', condition_obtention: 'DO_FIRST_SESSION' };

            // User already has this badge
            prisma.badges_utilisateurs.findMany.mockResolvedValue([{ id_badge: 1 }]);
            prisma.badges.findMany.mockResolvedValue([badgeDone]);

            const newBadges = await userService.checkNewBadges(1);

            expect(newBadges.length).toBe(0);
        });

        it('should award SEVEN_DAYS_COMPLETED badge', async () => {
            const badge = { id_badge: 2, nom: '7 Days', condition_obtention: 'SEVEN_DAYS_COMPLETED' };
            prisma.badges_utilisateurs.findMany.mockResolvedValue([]);
            prisma.badges.findMany.mockResolvedValue([badge]);

            prisma.objectifs.count.mockResolvedValue(2); // 2 objectives per day

            // Mock 7 days of completed objectives
            const completedGoals = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                completedGoals.push({ date, statut: 'done' });
                completedGoals.push({ date, statut: 'done' });
            }
            prisma.objectifs_utilisateurs.findMany.mockResolvedValue(completedGoals);

            const newBadges = await userService.checkNewBadges(1);
            expect(newBadges.length).toBe(1);
            expect(newBadges[0].name).toBe('7 Days');
        });

        it('should award ADD_FIRST_FOOD badge', async () => {
            const badge = { id_badge: 3, nom: 'First Food', condition_obtention: 'ADD_FIRST_FOOD' };
            prisma.badges_utilisateurs.findMany.mockResolvedValue([]);
            prisma.badges.findMany.mockResolvedValue([badge]);
            prisma.suivis_nutritionnels.findFirst.mockResolvedValue({ id: 1 });

            const newBadges = await userService.checkNewBadges(1);
            expect(newBadges.length).toBe(1);
            expect(newBadges[0].name).toBe('First Food');
        });

        it('should award FIRST_DAY_COMPLETED badge', async () => {
            const badge = { id_badge: 4, nom: 'First Day', condition_obtention: 'FIRST_DAY_COMPLETED' };
            prisma.badges_utilisateurs.findMany.mockResolvedValue([]);
            prisma.badges.findMany.mockResolvedValue([badge]);

            prisma.objectifs.count.mockResolvedValue(3);
            prisma.objectifs_utilisateurs.count.mockResolvedValue(3);

            const newBadges = await userService.checkNewBadges(1);
            expect(newBadges.length).toBe(1);
            expect(newBadges[0].name).toBe('First Day');
        });
    });

    describe('getProgressStats', () => {
        it('should return correct statistics for a week', async () => {
            const userId = 1;
            const period = 'week';

            // Mock Evolutions
            const evolutions = [
                { date: new Date('2023-12-25'), poids: 80 },
                { date: new Date('2024-01-01'), poids: 79 }
            ];
            prisma.evolutions.findMany.mockResolvedValue(evolutions);

            // Mock Nutrition
            const nutrition = [
                {
                    date: new Date('2024-01-01'),
                    quantite: 100,
                    aliments: { calories: 200, proteines: 20, glucides: 30, lipides: 10 }
                }
            ];
            prisma.suivis_nutritionnels.findMany.mockResolvedValue(nutrition);

            // Mock Preferences
            prisma.preferences.findFirst.mockResolvedValue({
                calories_quotidiennes: 2000,
                seances_par_semaines: 3
            });

            // Mock Sessions
            const sessions = [
                {
                    date: new Date('2024-01-01'),
                    seances: { seances_tags: [{ tags: { nom: 'Cardio' } }] }
                }
            ];
            prisma.suivis_sportifs.findMany.mockResolvedValue(sessions);

            const result = await userService.getProgressStats(userId, period);

            // Weight Stats
            expect(result.weight.current).toBe(79);
            expect(result.weight.change).toBe(-1);
            expect(result.weight.trend).toBe('descending');

            // Nutrition Stats
            expect(result.nutrition.averageCalories).toBe(200); // 200 * 100 / 100
            expect(result.nutrition.averageProteins).toBe(20);

            // Activity Stats
            expect(result.activity.completedSessions).toBe(1);
            expect(result.activity.mostFrequentActivity).toBe('Cardio');
        });

        it('should handle empty data gracefully', async () => {
            prisma.evolutions.findMany.mockResolvedValue([]);
            prisma.suivis_nutritionnels.findMany.mockResolvedValue([]);
            prisma.preferences.findFirst.mockResolvedValue(null);
            prisma.suivis_sportifs.findMany.mockResolvedValue([]);

            const result = await userService.getProgressStats(1, 'month');

            expect(result.weight).toBeNull();
            expect(result.nutrition.averageCalories).toBe(0);
            expect(result.activity.completedSessions).toBe(0);
        });
    });

    describe('getUserEvolution', () => {
        it('should return formatted evolution and statistics', async () => {
            const evolutions = [
                { date: new Date('2023-01-01'), poids: 80, taille: 180 },
                { date: new Date('2023-01-15'), poids: 78, taille: 180 },
            ];
            prisma.evolutions.findMany.mockResolvedValue(evolutions);

            const result = await userService.getUserEvolution(1, '2023-01-01', '2023-01-31');

            expect(result.evolution.length).toBe(2);
            expect(result.evolution[0].weight).toBe(80);
            expect(result.statistics.weightChange).toBe(-2);
        });
    });

    describe('addEvolution', () => {
        it('should add a new evolution and calculate BMI', async () => {
            const evolutionData = { weight: 75, height: 180 };
            const created = { id_evolution: 1, date: new Date(), ...evolutionData };
            prisma.evolutions.create.mockResolvedValue(created);

            const result = await userService.addEvolution(1, evolutionData);

            expect(result.weight).toBe(75);
            expect(result.bmi).toBe(23.1); // (75 / (1.8 * 1.8))
            expect(prisma.evolutions.create).toHaveBeenCalled();
        });

        it('should throw an error if weight or height is missing', async () => {
            await expect(userService.addEvolution(1, { height: 180 })).rejects.toThrow('Poids et taille requis');
        });
    });

    describe('updateUserProfile', () => {
        it('should update a user profile and return the updated data', async () => {
            const updateData = { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', gender: 'F', birthDate: '1992-02-02' };
            const updatedUserInDb = { id_user: 1, prenom: 'Jane', nom: 'Doe', email: 'jane.doe@example.com', sexe: 'F', date_de_naissance: new Date('1992-02-02') };

            prisma.users.findFirst.mockResolvedValue(null); // Mock that new email is not taken
            prisma.users.update.mockResolvedValue(updatedUserInDb);

            const result = await userService.updateUserProfile(1, updateData);

            expect(prisma.users.update).toHaveBeenCalledWith({
                where: { id_user: 1 },
                data: {
                    prenom: 'Jane',
                    nom: 'Doe',
                    email: 'jane.doe@example.com',
                    sexe: 'F',
                    date_de_naissance: new Date('1992-02-02'),
                },
            });
            expect(result.firstName).toBe('Jane');
            expect(result.age).toBe(31); // Corrected Age: 2024 - 1992 -> 32, but month/day makes it 31
        });

        it('should throw an error if the new email is already taken', async () => {
            const updateData = { email: 'existing@email.com' };
            // Mock that another user (id_user: 2) already has this email
            prisma.users.findFirst.mockResolvedValue({ id_user: 2, email: 'existing@email.com' });

            await expect(userService.updateUserProfile(1, updateData)).rejects.toThrow('Cet email est déjà utilisé');
        });
    });

    describe('getWeightUpdateStatus', () => {
        it('should return needsUpdate: true if last update was > 20 days ago', async () => {
            const lastEvo = { date: new Date('2023-12-01') }; // More than 20 days before mocked 'today' (2024-01-01)
            prisma.users.findUnique.mockResolvedValue({ cree_a: new Date('2023-01-01') });
            prisma.evolutions.findFirst.mockResolvedValue(lastEvo);

            const result = await userService.getWeightUpdateStatus(1);
            expect(result.needsUpdate).toBe(true);
            expect(result.daysSinceLastUpdate).toBeGreaterThan(20);
        });

        it('should return needsUpdate: false if last update was recent', async () => {
            const lastEvo = { date: new Date('2023-12-20') }; // Less than 20 days
            prisma.users.findUnique.mockResolvedValue({ cree_a: new Date('2023-01-01') });
            prisma.evolutions.findFirst.mockResolvedValue(lastEvo);

            const result = await userService.getWeightUpdateStatus(1);
            expect(result.needsUpdate).toBe(false);
        });
    });
});