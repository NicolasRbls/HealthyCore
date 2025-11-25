const request = require('supertest');
const app = require('../../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('User Program Routes', () => {
    let userToken;
    let testUser;
    let authorUser;
    let testProgram;
    let testSession;

    beforeAll(async () => {
        // Clean up potential leftover data
        await prisma.programmes_utilisateurs.deleteMany({});
        await prisma.seances_programmes.deleteMany({});
        await prisma.seances.deleteMany({});
        await prisma.programmes.deleteMany({
            where: {
                nom: {
                    in: ['User Test Program']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['user-program-test@example.com', 'author-program-test@example.com']
                }
            }
        });

        // Create a user to run the tests
        const hashedPassword = await bcrypt.hash('password123', 10);
        testUser = await prisma.users.create({
            data: {
                prenom: 'Test',
                nom: 'User',
                email: 'user-program-test@example.com',
                mot_de_passe: hashedPassword,
                sexe: 'M',
                date_de_naissance: new Date('1990-01-01'),
                role: 'user'
            }
        });

        userToken = jwt.sign(
            { userId: testUser.id_user, email: testUser.email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Create a user to be the author of the program
        authorUser = await prisma.users.create({
            data: {
                prenom: 'Author',
                nom: 'User',
                email: 'author-program-test@example.com',
                mot_de_passe: hashedPassword,
                sexe: 'F',
                date_de_naissance: new Date('1990-01-01'),
                role: 'user'
            }
        });

        // Create a Test Program authored by the other user
        testProgram = await prisma.programmes.create({
            data: {
                nom: 'User Test Program',
                id_user: authorUser.id_user,
                duree: 14
            }
        });

        // Create a Test Session
        testSession = await prisma.seances.create({
            data: {
                nom: 'Test Session for Program',
                id_user: authorUser.id_user
            }
        });

        // Link session to program
        await prisma.seances_programmes.create({
            data: {
                id_programme: testProgram.id_programme,
                id_seance: testSession.id_seance,
                ordre_seance: 1
            }
        });
    });

    afterAll(async () => {
        // Cleanup
        await prisma.programmes_utilisateurs.deleteMany({});
        await prisma.seances_programmes.deleteMany({});
        await prisma.seances.deleteMany({});
        await prisma.programmes.deleteMany({
            where: {
                nom: {
                    in: ['User Test Program']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['user-program-test@example.com', 'author-program-test@example.com']
                }
            }
        });
        await prisma.$disconnect();
    });

    // Assuming the user routes for programs are under /api/data/programs
    // based on the file structure src/modules/data/programs
    describe('GET /api/data/programs', () => {
        it('should return a list of available programs', async () => {
            const res = await request(app)
                .get('/api/data/programs')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(Array.isArray(res.body.data.programs)).toBe(true);
            expect(res.body.data.programs.length).toBeGreaterThan(0);
        });

        it('should require authentication', async () => {
            const res = await request(app)
                .get('/api/data/programs');
            expect(res.statusCode).toEqual(401);
        });
    });

    describe('GET /api/data/programs/:programId', () => {
        it('should return details of a single program', async () => {
            const res = await request(app)
                .get(`/api/data/programs/${testProgram.id_programme}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.program.id).toBe(testProgram.id_programme);
            expect(res.body.data.program.name).toBe('User Test Program');
        });

        it('should return 404 for a non-existent program', async () => {
            const res = await request(app)
                .get('/api/data/programs/999999')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(404);
        });
    });

    describe('POST /api/data/programs/:programId/start', () => {
        it('should allow a user to start a program', async () => {
            const res = await request(app)
                .post(`/api/data/programs/${testProgram.id_programme}/start`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({
                    startDate: new Date().toISOString()
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.userProgram.programId).toBe(testProgram.id_programme);
            expect(res.body.data.userProgram.progressPercentage).toBe(0);
        });

        it('should prevent starting the same program twice', async () => {
            // First, start the program
            await request(app)
                .post(`/api/data/programs/${testProgram.id_programme}/start`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ startDate: new Date().toISOString() });
            
            // Then, try to start it again
            const res = await request(app)
                .post(`/api/data/programs/${testProgram.id_programme}/start`)
                .set('Authorization', `Bearer ${userToken}`)
                .send({ startDate: new Date().toISOString() });

            expect(res.statusCode).toEqual(409); // Conflict
        });
    });

    describe('GET /api/data/programs/today-session', () => {
        const OriginalDate = global.Date;

        beforeAll(() => {
            const wednesday = new OriginalDate('2023-01-04T10:00:00Z');
            
            const mockDate = class extends OriginalDate {
                constructor(...args) {
                    if (args.length > 0) {
                        // Allow constructing with arguments, e.g., new Date('2023-01-02T00:00:00Z')
                        super(...args);
                    } else {
                        // Default to our mocked "now"
                        return wednesday;
                    }
                }

                static now() {
                    return wednesday.getTime();
                }

                // Keep other static methods
                static UTC(...args) {
                    return OriginalDate.UTC(...args);
                }

                static parse(...args) {
                    return OriginalDate.parse(...args);
                }
            };

            global.Date = mockDate;
        });

        afterAll(() => {
            global.Date = OriginalDate;
        });


        it('should return null when user has no active program', async () => {
            await prisma.programmes_utilisateurs.deleteMany({ where: { id_user: testUser.id_user } });
            
            const res = await request(app)
                .get('/api/data/programs/today-session')
                .set('Authorization', `Bearer ${userToken}`);
            
            expect(res.statusCode).toEqual(200);
            expect(res.body.data.todaySession).toBeNull();
        });

        it('should return the correct session for today if a program is active on a training day', async () => {
            await prisma.programmes_utilisateurs.deleteMany({ where: { id_user: testUser.id_user } });
            
            await prisma.programmes_utilisateurs.create({
                data: {
                    id_user: testUser.id_user,
                    id_programme: testProgram.id_programme,
                    date_debut: new Date('2023-01-02T00:00:00Z'), // Monday, so Wednesday is a training day
                    date_fin: new Date('2023-01-16T00:00:00Z'),
                }
            });

            const res = await request(app)
                .get('/api/data/programs/today-session')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.todaySession).not.toBeNull();
            expect(res.body.data.todaySession.id).toBe(testSession.id_seance);
        });

        it('should return null if a program is active but today is not a training day', async () => {
            await prisma.programmes_utilisateurs.deleteMany({ where: { id_user: testUser.id_user } });
            
            // This program has 1 session, which is on Wednesday. Let's start it on Thursday.
            await prisma.programmes_utilisateurs.create({
                data: {
                    id_user: testUser.id_user,
                    id_programme: testProgram.id_programme,
                    date_debut: new Date('2023-01-05T00:00:00Z'), // A Thursday, so Wednesday (our mocked "today") is not a training day
                    date_fin: new Date('2023-01-19T00:00:00Z'),
                }
            });

            const res = await request(app)
                .get('/api/data/programs/today-session')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.data.todaySession).toBeNull();
        });
    });
});
