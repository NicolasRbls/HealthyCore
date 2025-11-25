const request = require('supertest');
const app = require('../../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

describe('Admin Food Routes', () => {
    let adminToken;
    let userToken;
    let adminUser;
    let regularUser;
    let testFood;

    beforeAll(async () => {
        // Clean up
        await prisma.aliments.deleteMany({
            where: {
                nom: {
                    in: ['Test Food', 'New Food', 'Updated Food', 'Delete Food']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-food-test@example.com', 'user-food-test@example.com']
                }
            }
        });

        // Create Admin User
        const hashedPassword = await bcrypt.hash('password123', 10);
        adminUser = await prisma.users.create({
            data: {
                prenom: 'Admin',
                nom: 'Food',
                email: 'admin-food-test@example.com',
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
                nom: 'Food',
                email: 'user-food-test@example.com',
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

        // Create Test Food
        testFood = await prisma.aliments.create({
            data: {
                nom: 'Test Food',
                type: 'produit',
                calories: 100,
                proteines: 10,
                glucides: 10,
                lipides: 2,
                source: 'admin',
                id_user: adminUser.id_user,
                code_barres: '123456789',
                temps_preparation: 30
            }
        });
    });

    afterAll(async () => {
        // Cleanup
        await prisma.aliments.deleteMany({
            where: {
                nom: {
                    in: ['Test Food', 'New Food', 'Updated Food', 'Delete Food']
                }
            }
        });
        await prisma.users.deleteMany({
            where: {
                email: {
                    in: ['admin-food-test@example.com', 'user-food-test@example.com']
                }
            }
        });
        await prisma.$disconnect();
    });

    describe('GET /api/admin/foods', () => {
        it('should return list of foods for admin', async () => {
            const res = await request(app)
                .get('/api/admin/foods')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('foods');
            expect(Array.isArray(res.body.data.foods)).toBe(true);
            expect(res.body.data.foods.length).toBeGreaterThan(0);
        });

        it('should deny access for regular user', async () => {
            const res = await request(app)
                .get('/api/admin/foods')
                .set('Authorization', `Bearer ${userToken}`);

            expect(res.statusCode).toEqual(403);
        });
    });

    describe('GET /api/admin/foods/:foodId', () => {
        it('should return food details for admin', async () => {
            const res = await request(app)
                .get(`/api/admin/foods/${testFood.id_aliment}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.id).toBe(testFood.id_aliment);
        });
    });

    describe('POST /api/admin/foods', () => {
        it('should create a new food', async () => {
            const res = await request(app)
                .post('/api/admin/foods')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    name: 'New Food',
                    type: 'produit',
                    calories: 200,
                    proteins: 20,
                    carbs: 20,
                    fats: 5,
                    userId: adminUser.id_user,
                    barcode: '987654321'
                });

            expect(res.statusCode).toEqual(201);
            expect(res.body.status).toBe('success');
            expect(res.body.data.nom).toBe('New Food');
        });
    });

    describe('PUT /api/admin/foods/:foodId', () => {
        it('should update an existing food', async () => {
            const res = await request(app)
                .put(`/api/admin/foods/${testFood.id_aliment}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send({
                    nom: 'Updated Food',
                    calories: 150
                });

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data.name).toBe('Updated Food');
            expect(res.body.data.calories).toBe(150);
        });
    });

    describe('DELETE /api/admin/foods/:foodId', () => {
        it('should delete a food', async () => {
            // Create a temporary food to delete
            const foodToDelete = await prisma.aliments.create({
                data: {
                    nom: 'Delete Food',
                    type: 'produit',
                    calories: 50,
                    proteines: 5,
                    glucides: 5,
                    lipides: 1,
                    source: 'admin',
                    id_user: adminUser.id_user,
                    code_barres: '111222333',
                    temps_preparation: 15
                }
            });

            const res = await request(app)
                .delete(`/api/admin/foods/${foodToDelete.id_aliment}`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toEqual(200);

            const deletedFood = await prisma.aliments.findUnique({ where: { id_aliment: foodToDelete.id_aliment } });
            expect(deletedFood).toBeNull();
        });
    });

    describe('GET /api/admin/foods/stats', () => {
        it('should return food stats', async () => {
            const res = await request(app)
                .get('/api/admin/foods/stats') // Note: Express router matches /stats before /:foodId if defined first.
                .set('Authorization', `Bearer ${adminToken}`);

            // Check if stats route is correctly ordered in routes file.
            // In admin.foods.routes.js:
            // router.get("/stats", ...);
            // router.get("/:foodId", ...);
            // So it should work.

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(res.body.data).toHaveProperty('stats');
        });
    });
});
