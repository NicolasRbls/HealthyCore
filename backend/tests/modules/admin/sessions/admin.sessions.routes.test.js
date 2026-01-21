const request = require('supertest');
const app = require('../../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Admin Session Routes', () => {
    let adminToken;
    let userToken;
    let adminUser;
    let regularUser;
    let testSession;

    beforeAll(async () => {
        // Clean up potential leftover data
        await prisma.seances.deleteMany({
            where: {
                nom: {
                    in: ['Test Session', 'New Session', 'Updated Session', 'Delete Session']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-session-test@example.com', 'user-session-test@example.com']
                }
            }
        });

        // Create Admin User
        const hashedPassword = await bcrypt.hash('password123', 10);
        adminUser = await prisma.users.create({
            data: {
                prenom: 'Admin',
                nom: 'Session',
                email: 'admin-session-test@example.com',
                mot_de_passe: hashedPassword,
                sexe: 'M',
                date_de_naissance: new Date('1990-01-01'),
                role: 'admin'
            }
        });

        adminToken = jwt.sign(
            { userId: adminUser.id_user, email: adminUser.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Create Regular User
        regularUser = await prisma.users.create({
            data: {
                prenom: 'User',
                nom: 'Session',
                email: 'user-session-test@example.com',
                mot_de_passe: hashedPassword,
                sexe: 'F',
                date_de_naissance: new Date('1995-01-01'),
                role: 'user'
            }
        });

        userToken = jwt.sign(
            { userId: regularUser.id_user, email: regularUser.email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Create Test Session
        testSession = await prisma.seances.create({
            data: {
                nom: 'Test Session',
                id_user: adminUser.id_user // Assuming a session must belong to a user
            }
        });
    });

    afterAll(async () => {
        // Cleanup
        await prisma.seances.deleteMany({
            where: {
                nom: {
                    in: ['Test Session', 'New Session', 'Updated Session', 'Delete Session']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-session-test@example.com', 'user-session-test@example.com']
                }
            }
        });
        await prisma.$disconnect();
    });

    describe('GET /api/admin/sessions', () => {
        it('should return list of sessions for admin', async () => {
            const res = await request(app)
                .get('/api/admin/sessions')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('sessions');
            expect(Array.isArray(res.body.data.sessions)).toBe(true);
        });

        it('should deny access for regular user', async () => {
            const res = await request(app)
                .get('/api/admin/sessions')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/admin/sessions/:sessionId', () => {
        it('should return session details for admin', async () => {
            const res = await request(app)
                .get(`/api/admin/sessions/${testSession.id_seance}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            // Assuming the service will return an object with a nested session
            expect(res.body.data.session.id).toBe(testSession.id_seance);
        });
    });

    describe('POST /api/admin/sessions', () => {
        it('should create a new session', async () => {
            const res = await request(app)
                .post('/api/admin/sessions')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'New Session',
                    userId: adminUser.id_user,
                    tagIds: [],
                    exercises: []
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.session.name).toBe('New Session');
        });
    });

    describe('PUT /api/admin/sessions/:sessionId', () => {
        it('should update an existing session', async () => {
            const res = await request(app)
                .put(`/api/admin/sessions/${testSession.id_seance}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Updated Session',
                    userId: adminUser.id_user,
                    tagIds: [],
                    exercises: []
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.session.name).toBe('Updated Session');
        });
    });

    describe('DELETE /api/admin/sessions/:sessionId', () => {
        it('should delete a session', async () => {
            const sessionToDelete = await prisma.seances.create({
                data: {
                    nom: 'Delete Session',
                    id_user: adminUser.id_user
                }
            });

            const res = await request(app)
                .delete(`/api/admin/sessions/${sessionToDelete.id_seance}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);

            const deletedSession = await prisma.seances.findUnique({ where: { id_seance: sessionToDelete.id_seance } });
            expect(deletedSession).toBeNull();
        });
    });
});
