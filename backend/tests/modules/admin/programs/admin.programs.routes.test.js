const request = require('supertest');
const app = require('../../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Admin Program Routes', () => {
    let adminToken;
    let userToken;
    let adminUser;
    let regularUser;
    let testProgram;

    beforeAll(async () => {
        // Clean up potential leftover data
        await prisma.programmes.deleteMany({
            where: {
                nom: {
                    in: ['Test Program', 'New Program', 'Updated Program', 'Delete Program']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-program-test@example.com', 'user-program-test@example.com']
                }
            }
        });

        // Create Admin User
        const hashedPassword = await bcrypt.hash('password123', 10);
        adminUser = await prisma.users.create({
            data: {
                prenom: 'Admin',
                nom: 'Program',
                email: 'admin-program-test@example.com',
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
                nom: 'Program',
                email: 'user-program-test@example.com',
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

        // Create Test Program
        testProgram = await prisma.programmes.create({
            data: {
                nom: 'Test Program',
                id_user: adminUser.id_user, // Assuming a program must belong to a user
                duree: 7 // Assuming duration in days/weeks
            }
        });
    });

    afterAll(async () => {
        // Cleanup
        await prisma.programmes.deleteMany({
            where: {
                nom: {
                    in: ['Test Program', 'New Program', 'Updated Program', 'Delete Program']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-program-test@example.com', 'user-program-test@example.com']
                }
            }
        });
        await prisma.$disconnect();
    });

    describe('GET /api/admin/programs', () => {
        it('should return list of programs for admin', async () => {
            const res = await request(app)
                .get('/api/admin/programs')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('programs');
            expect(Array.isArray(res.body.data.programs)).toBe(true);
        });

        it('should deny access for regular user', async () => {
            const res = await request(app)
                .get('/api/admin/programs')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/admin/programs/:programId', () => {
        it('should return program details for admin', async () => {
            const res = await request(app)
                .get(`/api/admin/programs/${testProgram.id_programme}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            // Assuming the service will return an object with a nested program
            expect(res.body.data.program.id_programme).toBe(testProgram.id_programme);
        });
    });

    describe('POST /api/admin/programs', () => {
        it('should create a new program', async () => {
            const res = await request(app)
                .post('/api/admin/programs')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'New Program',
                    duration: 14,
                    tagIds: [],
                    sessions: []                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.program.nom).toBe('New Program');
        });
    });

    describe('PUT /api/admin/programs/:programId', () => {
        it('should update an existing program', async () => {
            const res = await request(app)
                .put(`/api/admin/programs/${testProgram.id_programme}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Updated Program',
                    duration: 21,
                    tagIds: [],
                    sessions: []
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.program.nom).toBe('Updated Program');
        });
    });

    describe('DELETE /api/admin/programs/:programId', () => {
        it('should delete a program', async () => {
            const programToDelete = await prisma.programmes.create({
                data: {
                    nom: 'Delete Program',
                    id_user: adminUser.id_user,
                    duree: 1
                }
            });

            const res = await request(app)
                .delete(`/api/admin/programs/${programToDelete.id_programme}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);

            const deletedProgram = await prisma.programmes.findUnique({ where: { id_programme: programToDelete.id_programme } });
            expect(deletedProgram).toBeNull();
        });
    });
});
