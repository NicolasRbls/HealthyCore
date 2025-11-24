const request = require('supertest');
const app = require('../../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Admin Exercise Routes', () => {
    let adminToken;
    let userToken;
    let adminUser;
    let regularUser;
    let testExercise;

    beforeAll(async () => {
        // Clean up potential leftover data
        await prisma.exercices.deleteMany({
            where: {
                nom: {
                    in: ['Test Exercise', 'New Exercise', 'Updated Exercise', 'Delete Exercise']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-exercise-test@example.com', 'user-exercise-test@example.com']
                }
            }
        });

        // Create Admin User
        const hashedPassword = await bcrypt.hash('password123', 10);
        adminUser = await prisma.users.create({
            data: {
                prenom: 'Admin',
                nom: 'Exercise',
                email: 'admin-exercise-test@example.com',
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
                nom: 'Exercise',
                email: 'user-exercise-test@example.com',
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

        // Create Test Exercise
        testExercise = await prisma.exercices.create({
            data: {
                                            nom: 'Test Exercise',
                                            description: 'A simple exercise for testing.'            }
        });
    });

    afterAll(async () => {
        // Cleanup
        await prisma.exercices.deleteMany({
            where: {
                nom: {
                    in: ['Test Exercise', 'New Exercise', 'Updated Exercise', 'Delete Exercise']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-exercise-test@example.com', 'user-exercise-test@example.com']
                }
            }
        });
        await prisma.$disconnect();
    });

    describe('GET /api/admin/exercises', () => {
        it('should return list of exercises for admin', async () => {
            const res = await request(app)
                .get('/api/admin/exercises')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('exercises');
            expect(Array.isArray(res.body.data.exercises)).toBe(true);
        });

        it('should deny access for regular user', async () => {
            const res = await request(app)
                .get('/api/admin/exercises')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/admin/exercises/:exerciseId', () => {
        it('should return exercise details for admin', async () => {
            const res = await request(app)
                .get(`/api/admin/exercises/${testExercise.id_exercice}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.exercise.id).toBe(testExercise.id_exercice);
        });
    });

    describe('POST /api/admin/exercises', () => {
        it('should create a new exercise', async () => {
            const res = await request(app)
                .post('/api/admin/exercises')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'New Exercise',
                    description: 'A brand new exercise.',
                    tagIds: []
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.exercise.name).toBe('New Exercise');
        });
    });

    describe('PUT /api/admin/exercises/:exerciseId', () => {
        it('should update an existing exercise', async () => {
            const res = await request(app)
                .put(`/api/admin/exercises/${testExercise.id_exercice}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Updated Exercise',
                    description: 'A simple exercise for testing.',
                    tagIds: [] // Ensuring description is present for validation
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.exercise.name).toBe('Updated Exercise');
        });
    });

    describe('DELETE /api/admin/exercises/:exerciseId', () => {
        it('should delete an exercise', async () => {
            const exerciseToDelete = await prisma.exercices.create({
                data: {
                    nom: 'Delete Exercise',
                    description: 'This will be deleted.'
                }
            });

            const res = await request(app)
                .delete(`/api/admin/exercises/${exerciseToDelete.id_exercice}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);

            const deletedExercise = await prisma.exercices.findUnique({ where: { id_exercice: exerciseToDelete.id_exercice } });
            expect(deletedExercise).toBeNull();
        });
    });
});
