const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

describe('Sync API', () => {
    let token;
    let userId;

    beforeAll(async () => {
        // Create a test user
        const uniqueEmail = `syncuser_${Date.now()}@example.com`;
        const user = await prisma.users.create({
            data: {
                prenom: 'Sync',
                nom: 'User',
                email: uniqueEmail,
                mot_de_passe: 'hashedpassword',
                date_de_naissance: new Date('1990-01-01'),
                sexe: 'M'
            }
        });
        userId = user.id_user;
        token = jwt.sign({ userId: user.id_user }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    });

    afterAll(async () => {
        // Cleanup
        await prisma.users.delete({ where: { id_user: userId } });
        await prisma.$disconnect();
    });

    it('should return empty pull data given a future lastSync date', async () => {
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        const res = await request(app)
            .post('/api/sync')
            .set('Authorization', `Bearer ${token}`)
            .send({
                lastSync: futureDate.toISOString(),
                push: {}
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.status).toEqual('success');
        expect(res.body.data.pull.programmes).toHaveLength(0);
        expect(res.body.data.pull.users).toHaveLength(0);
    });

    it('should return updated user data if lastSync is old', async () => {
        const oldDate = new Date('2000-01-01').toISOString();

        // Ensure user is updated "recently"
        await prisma.users.update({
            where: { id_user: userId },
            data: { mis_a_jour_a: new Date() }
        });

        const res = await request(app)
            .post('/api/sync')
            .set('Authorization', `Bearer ${token}`)
            .send({
                lastSync: oldDate,
                push: {}
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body.data.pull.users).toHaveLength(1);
        expect(res.body.data.pull.users[0].email).toBeDefined();
    });

    it('should reject unauthenticated request', async () => {
        const res = await request(app)
            .post('/api/sync')
            .send({});
        expect(res.statusCode).toEqual(401);
    });
});
