const request = require('supertest');
const app = require('../../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Admin User Routes', () => {
    let adminToken;
    let userToken;
    let adminUser;
    let regularUser;
    let userToDelete;

    beforeAll(async () => {
        // Clean up
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-test@example.com', 'user-test@example.com', 'delete-test@example.com']
                }
            }
        });

        // Create Admin User
        const hashedPassword = await bcrypt.hash('password123', 10);
        adminUser = await prisma.users.create({
            data: {
                prenom: 'Admin',
                nom: 'Test',
                email: 'admin-test@example.com',
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
                nom: 'Test',
                email: 'user-test@example.com',
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

        // Create User to Delete
        userToDelete = await prisma.users.create({
            data: {
                prenom: 'Delete',
                nom: 'Me',
                email: 'delete-test@example.com',
                mot_de_passe: hashedPassword,
                sexe: 'M',
                date_de_naissance: new Date('2000-01-01'),
                role: 'user'
            }
        });
    });

    afterAll(async () => {
        // Cleanup
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-test@example.com', 'user-test@example.com', 'delete-test@example.com']
                }
            }
        });
        await prisma.$disconnect();
    });

    describe('GET /api/admin/user/count', () => {
        it('should return user count for admin', async () => {
            const res = await request(app)
                .get('/api/admin/user/count')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('count');
            expect(typeof res.body.data.count).toBe('number');
        });

        it('should deny access for regular user', async () => {
            const res = await request(app)
                .get('/api/admin/user/count')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/admin/user', () => {
        it('should return list of users for admin', async () => {
            const res = await request(app)
                .get('/api/admin/user')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('users');
            expect(Array.isArray(res.body.data.users)).toBe(true);
        });
    });

    describe('GET /api/admin/user/:id', () => {
        it('should return user details for admin', async () => {
            const res = await request(app)
                .get(`/api/admin/user/${regularUser.id_user}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.id).toBe(regularUser.id_user);
        });
    });

    describe('DELETE /api/admin/user/:id', () => {
        it('should delete user for admin', async () => {
            const res = await request(app)
                .delete(`/api/admin/user/${userToDelete.id_user}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ password: 'password123' }); // Assuming password confirmation might be needed, checking controller next if it fails.

            // Wait, let's check controller logic for delete. 
            // Usually admin delete might not need password, or it might.
            // I'll assume it doesn't for now, but if it fails I'll check.
            // Actually, looking at service `checkAdminPassword` is exported, so maybe it is used.
            // Let's check `admin.user.controller.js` quickly before running if possible, but I'll just run it and see.

            // If it requires password in body, I'll add it.
            // For now I'll send it just in case.

            expect(res.statusCode).toEqual(200);

            // Verify deletion
            const deletedUser = await prisma.users.findUnique({ where: { id_user: userToDelete.id_user } });
            expect(deletedUser).toBeNull();
        });
    });
});
