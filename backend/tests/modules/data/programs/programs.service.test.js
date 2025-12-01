const { PrismaClient } = require('@prisma/client');
const { getUserPrograms, getProgramDetails, startProgram, getUserSessions, getSessionDetails, completeSession, getSportProgress } = require('../../../../src/modules/data/programs/programs.service');

// Mock the Prisma client
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        preferences: { findFirst: jest.fn() },
        programmes_utilisateurs: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
        programmes: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn() },
        suivis_sportifs: { count: jest.fn(), findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn() },
        seances: { findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn() },
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

let prisma;

beforeEach(() => {
    prisma = new PrismaClient();
    // Reset mocks before each test
    jest.clearAllMocks();
});

describe('User Programs Service', () => {

    describe('getUserPrograms', () => {
        it('should return a list of programs and recommendations', async () => {
            // Mock data
            const mockUserPreferences = {
                preferences_activites: [],
                seances_par_semaines: 3,
            };
            const mockActivePrograms = [];
            const mockPrograms = [
                { id_programme: 1, nom: 'Program 1', duree: 7, programmes_tags: [], seances_programmes: [] },
            ];
            const mockTotal = mockPrograms.length;

            // Mock Prisma calls
            prisma.preferences.findFirst.mockResolvedValue(mockUserPreferences);
            prisma.programmes_utilisateurs.findMany.mockResolvedValue(mockActivePrograms);
            prisma.programmes.findMany.mockResolvedValueOnce(mockPrograms) // For the main query
                .mockResolvedValueOnce(mockPrograms); // For the recommendation query
            prisma.programmes.count.mockResolvedValue(mockTotal);

            const result = await getUserPrograms(1);

            expect(result).toHaveProperty('programs');
            expect(result).toHaveProperty('recommendedPrograms');
            expect(result.programs.length).toBe(1);
            expect(result.programs[0].name).toBe('Program 1');
            expect(prisma.preferences.findFirst).toHaveBeenCalledWith({ where: { id_user: 1 }, include: expect.any(Object) });
        });

        it('should filter programs by tagId', async () => {
            // Mock data with tags
            const mockPrograms = [
                {
                    id_programme: 1, nom: 'Program 1', duree: 7,
                    programmes_tags: [{ id_tag: 1, tags: { id_tag: 1, nom: 'Cardio' } }],
                    seances_programmes: []
                },
                {
                    id_programme: 2, nom: 'Program 2', duree: 14,
                    programmes_tags: [{ id_tag: 2, tags: { id_tag: 2, nom: 'Strength' } }],
                    seances_programmes: []
                },
            ];

            // Mock Prisma calls
            prisma.preferences.findFirst.mockResolvedValue(null);
            prisma.programmes_utilisateurs.findMany.mockResolvedValue([]);
            prisma.programmes.findMany.mockResolvedValue([mockPrograms[0]]); // Only return the first program
            prisma.programmes.count.mockResolvedValue(1);

            const result = await getUserPrograms(1, 1, 10, 1); // Filtering for tagId: 1

            expect(result.programs.length).toBe(1);
            expect(result.programs[0].name).toBe('Program 1');
            expect(prisma.programmes.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: {
                    programmes_tags: {
                        some: { id_tag: 1 }
                    }
                }
            }));
        });

        it('should return recommended programs based on user preferences', async () => {
            const mockUserPreferences = {
                preferences_activites: [
                    { id_activite: 1, activites: { nom: 'Cardio' } }
                ],
                seances_par_semaines: 5,
            };
            const mockPrograms = [
                {
                    id_programme: 1, nom: 'Cardio Blast', duree: 7,
                    programmes_tags: [{ id_tag: 1, tags: { id_tag: 1, nom: 'Cardio' } }],
                    seances_programmes: [{ ordre_seance: 1 }, { ordre_seance: 2 }, { ordre_seance: 3 }]
                },
                {
                    id_programme: 2, nom: 'Strength Program', duree: 14,
                    programmes_tags: [{ id_tag: 2, tags: { id_tag: 2, nom: 'Strength' } }],
                    seances_programmes: [{ ordre_seance: 1 }]
                },
            ];

            prisma.preferences.findFirst.mockResolvedValue(mockUserPreferences);
            prisma.programmes_utilisateurs.findMany.mockResolvedValue([]);
            prisma.programmes.findMany.mockResolvedValueOnce([]) // First call for non-recommended
                .mockResolvedValueOnce(mockPrograms); // Second call for recommendations
            prisma.programmes.count.mockResolvedValue(0);

            const result = await getUserPrograms(1);

            expect(result.recommendedPrograms.length).toBeGreaterThan(0);
            expect(result.recommendedPrograms[0].name).toBe('Cardio Blast');
            expect(result.recommendedPrograms[0].matchScore).toBeGreaterThan(0);
        });
    });

    describe('getProgramDetails', () => {
        it('should return null if program not found', async () => {
            prisma.programmes.findUnique.mockResolvedValue(null);

            await expect(getProgramDetails(1, 999)).rejects.toThrow('Programme non trouvé');
        });

        it('should return program details with user progress if active', async () => {
            const mockProgram = {
                id_programme: 1,
                nom: 'Active Program',
                duree: 14,
                description: 'A test program',
                programmes_tags: [],
                seances_programmes: [
                    {
                        ordre_seance: 1,
                        seances: {
                            id_seance: 1,
                            nom: 'Session 1',
                            exercices_seances: [{ id_exercice: 101, series: 3, repetitions: 12, duree: 0, exercices: { id_exercice: 101, nom: 'Push-ups' } }]
                        }
                    },
                ],
                programmes_utilisateurs: []
            };
            const mockUserProgram = {
                id_user: 1,
                id_programme: 1,
                date_debut: new Date('2023-01-01'),
                date_fin: new Date('2023-01-15'),
            };

            prisma.programmes.findUnique.mockResolvedValue(mockProgram);
            prisma.programmes_utilisateurs.findFirst.mockResolvedValue(mockUserProgram);
            prisma.suivis_sportifs.count.mockResolvedValue(1); // User completed 1 session

            const result = await getProgramDetails(1, 1);

            expect(result.name).toBe('Active Program');
            expect(result.inProgress).toBe(true);
            expect(result).toHaveProperty('userProgress');
            expect(result.userProgress.completedSessions).toBe(1);
            expect(result.sessions.length).toBe(1);
            expect(result.sessions[0].name).toBe('Session 1');
        });
    });

    describe('startProgram', () => {
        it('should throw an error if program is already started', async () => {
            prisma.programmes.findUnique.mockResolvedValue({ id_programme: 1, seances_programmes: [] });
            prisma.programmes_utilisateurs.findFirst.mockResolvedValue({ id_programme_utilisateur: 1 });

            await expect(startProgram(1, 1)).rejects.toThrow('Vous suivez déjà ce programme');
        });

        it('should successfully start a program for a user', async () => {
            const mockProgram = { id_programme: 1, nom: 'New Program', duree: 7, seances_programmes: [] };
            const mockCreatedUserProgram = { id_programme_utilisateur: 123, id_programme: 1, date_debut: new Date(), date_fin: new Date() };

            prisma.programmes.findUnique.mockResolvedValue(mockProgram);
            prisma.programmes_utilisateurs.findFirst.mockResolvedValue(null); // Not already started
            prisma.programmes_utilisateurs.create.mockResolvedValue(mockCreatedUserProgram);

            const result = await startProgram(1, 1);

            expect(result.programId).toBe(1);
            expect(result.programName).toBe('New Program');
            expect(prisma.programmes_utilisateurs.create).toHaveBeenCalled();
        });

        it('should calculate end date correctly based on weeks (duration * 7)', async () => {
            const userId = 1;
            const programId = 1;
            const durationWeeks = 10;
            const startDate = new Date('2023-01-01T00:00:00.000Z');

            // Mock program data
            prisma.programmes.findUnique.mockResolvedValue({
                id_programme: programId,
                nom: 'Test Program',
                duree: durationWeeks,
                seances_programmes: [],
            });

            // Mock no existing program
            prisma.programmes_utilisateurs.findFirst.mockResolvedValue(null);

            // Mock creation
            prisma.programmes_utilisateurs.create.mockImplementation((args) => {
                return {
                    id_programme_utilisateur: 1,
                    ...args.data,
                };
            });

            const result = await startProgram(userId, programId, startDate.toISOString());

            const expectedEndDate = new Date(startDate);
            expectedEndDate.setDate(expectedEndDate.getDate() + durationWeeks * 7);
            expectedEndDate.setHours(0, 0, 0, 0);

            expect(result.endDate).toEqual(expectedEndDate);

            // Verify that the difference is exactly 70 days
            const diffTime = Math.abs(result.endDate - new Date(result.startDate));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            expect(diffDays).toBe(70);
        });
    });

    describe('getUserSessions', () => {
        it('should return a paginated list of sessions', async () => {
            const mockSessions = [
                { id_seance: 1, nom: 'Session 1', exercices_seances: [], seances_tags: [] },
                { id_seance: 2, nom: 'Session 2', exercices_seances: [], seances_tags: [] }
            ];
            prisma.seances.findMany.mockResolvedValue(mockSessions);
            prisma.seances.count.mockResolvedValue(mockSessions.length);

            const { sessions, pagination } = await getUserSessions(1, 10, null);

            expect(sessions.length).toBe(2);
            expect(pagination.total).toBe(2);
            expect(sessions[0].name).toBe('Session 1');
        });
    });

    describe('getSessionDetails', () => {
        it('should return details for a specific session', async () => {
            const mockSession = {
                id_seance: 1,
                nom: 'Full Body Workout',
                seances_tags: [],
                exercices_seances: [
                    { ordre_exercice: 1, series: 3, repetitions: 10, duree: 0, exercices: { id_exercice: 101, nom: 'Squats' } },
                    { ordre_exercice: 2, series: 3, repetitions: 12, duree: 0, exercices: { id_exercice: 102, nom: 'Bench Press' } }
                ]
            };
            prisma.seances.findUnique.mockResolvedValue(mockSession);

            const result = await getSessionDetails(1);

            expect(result.name).toBe('Full Body Workout');
            expect(result.exercises.length).toBe(2);
            expect(result.exercises[0].name).toBe('Squats');
        });

        it('should throw an error if the session is not found', async () => {
            prisma.seances.findUnique.mockResolvedValue(null);
            await expect(getSessionDetails(999)).rejects.toThrow('Séance non trouvée');
        });
    });

    describe('completeSession', () => {
        it('should successfully mark a session as complete', async () => {
            prisma.seances.findUnique.mockResolvedValue({ id_seance: 1, nom: 'Leg Day' });
            prisma.suivis_sportifs.findFirst.mockResolvedValue(null);
            prisma.suivis_sportifs.create.mockResolvedValue({ id_suivi_sportif: 1, id_seance: 1, id_user: 1 });

            const result = await completeSession(1, 1);

            expect(result.sessionId).toBe(1);
            expect(result.sessionName).toBe('Leg Day');
            expect(prisma.suivis_sportifs.create).toHaveBeenCalled();
        });

        it('should throw an error if the session does not exist', async () => {
            prisma.seances.findUnique.mockResolvedValue(null);
            await expect(completeSession(1, 999)).rejects.toThrow('Séance non trouvée');
        });

        it('should throw an error if the session is already completed for that day', async () => {
            prisma.seances.findUnique.mockResolvedValue({ id_seance: 1, nom: 'Leg Day' });
            prisma.suivis_sportifs.findFirst.mockResolvedValue({ id_suivi_sportif: 1 });

            await expect(completeSession(1, 1)).rejects.toThrow('Cette séance a déjà été marquée comme terminée pour cette date');
        });
    });

    describe('getSportProgress', () => {
        it('should return progress for a user with an active program', async () => {
            const mockActiveProgram = {
                id_programme: 1,
                date_debut: new Date('2023-01-01'),
                date_fin: new Date('2023-01-31'),
                programmes: {
                    nom: '30-Day Challenge',
                    seances_programmes: [
                        { ordre_seance: 1, seances: { id_seance: 1, nom: 'Session 1' } },
                        { ordre_seance: 2, seances: { id_seance: 2, nom: 'Session 2' } }
                    ]
                }
            };
            const mockFollowUps = [
                { id_suivi_sportif: 1, id_seance: 1, date: new Date(), seances: { nom: 'Session 1' } }
            ];

            prisma.programmes_utilisateurs.findFirst.mockResolvedValue(mockActiveProgram);
            prisma.suivis_sportifs.findMany.mockResolvedValue(mockFollowUps);

            const result = await getSportProgress(1);

            expect(result.activeProgram).not.toBeNull();
            expect(result.activeProgram.name).toBe('30-Day Challenge');
            expect(result.recentSessions.length).toBe(1);
        });

        it('should return null active program for a user with no active program', async () => {
            prisma.programmes_utilisateurs.findFirst.mockResolvedValue(null);

            const result = await getSportProgress(1);

            expect(result.activeProgram).toBeNull();
            expect(result.recentSessions.length).toBe(0);
        });
    });
});
