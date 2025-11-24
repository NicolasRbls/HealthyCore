const request = require('supertest');
const app = require('../../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Admin Tag Routes', () => {
    let adminToken;
    let userToken;
    let adminUser;
    let regularUser;
    let testTag;

    beforeAll(async () => {
        // Clean up
        await prisma.tags.deleteMany({
            where: {
                nom: {
                    in: ['Test Tag', 'Updated Tag', 'New Tag']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-tag-test@example.com', 'user-tag-test@example.com']
                }
            }
        });

        // Create Admin User
        const hashedPassword = await bcrypt.hash('password123', 10);
        adminUser = await prisma.users.create({
            data: {
                prenom: 'Admin',
                nom: 'Tag',
                email: 'admin-tag-test@example.com',
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
                nom: 'Tag',
                email: 'user-tag-test@example.com',
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

        // Create Test Tag
        testTag = await prisma.tags.create({
            data: {
                nom: 'Test Tag',
                type: 'aliment'
            }
        });
    });

    afterAll(async () => {
        // Cleanup
        await prisma.tags.deleteMany({
            where: {
                nom: {
                    in: ['Test Tag', 'Updated Tag', 'New Tag']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-tag-test@example.com', 'user-tag-test@example.com']
                }
            }
        });
        await prisma.$disconnect();
    });

    describe('GET /api/admin/tag', () => {
        it('should return list of tags for admin', async () => {
            const res = await request(app)
                .get('/api/admin/tag')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('tags');
            expect(Array.isArray(res.body.data.tags)).toBe(true);
            expect(res.body.data.tags.length).toBeGreaterThan(0);
        });

        it('should deny access for regular user', async () => {
            const res = await request(app)
                .get('/api/admin/tag')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/admin/tag/:id_tag', () => {
        it('should return tag details for admin', async () => {
            const res = await request(app)
                .get(`/api/admin/tag/${testTag.id_tag}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.tag.id_tag).toBe(testTag.id_tag);
        });
    });

    describe('POST /api/admin/tag', () => {
        it('should create a new tag', async () => {
            const res = await request(app)
                .post('/api/admin/tag')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'New Tag',
                    type: 'sport'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.nom).toBe('New Tag');
            expect(res.body.data.type).toBe('sport');
        });

        it('should fail with invalid type', async () => {
            const res = await request(app)
                .post('/api/admin/tag')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Invalid Tag',
                    type: 'invalid'
                });

            expect(res.statusCode).toEqual(400);
        });
    });

    describe('PUT /api/admin/tag/:id_tag', () => {
        it('should update an existing tag', async () => {
            const res = await request(app)
                .put(`/api/admin/tag/${testTag.id_tag}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'Updated Tag'
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.nom).toBe('Updated Tag');
        });
    });

    describe('DELETE /api/admin/tag/:id_tag', () => {
        it('should delete a tag', async () => {
            // Create a temporary tag to delete
            const tagToDelete = await prisma.tags.create({
                data: {
                    nom: 'Delete Me',
                    type: 'aliment'
                }
            });

            const res = await request(app)
                .delete(`/api/admin/tag/${tagToDelete.id_tag}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);

            const deletedTag = await prisma.tags.findUnique({ where: { id_tag: tagToDelete.id_tag } });
            expect(deletedTag).toBeNull();
        });
    });
});
