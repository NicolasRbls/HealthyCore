const request = require('supertest');
const app = require('../../../src/app');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { generateToken } = require('../../../src/utils/jwt.utils');
const bcrypt = require('bcryptjs');

describe('Auth Module - Password Recovery', () => {
    let testUser;

    beforeAll(async () => {
        // Connect to database
        await prisma.$connect();
    });

    afterAll(async () => {
        // Cleanup and disconnect
        await prisma.users.deleteMany({});
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        // Clean up users before each test
        await prisma.users.deleteMany({});

        // Create a test user
        const hashedPassword = await bcrypt.hash('Password123!', 10);
        testUser = await prisma.users.create({
            data: {
                email: 'test-recovery@example.com',
                mot_de_passe: hashedPassword,
                prenom: 'Test',
                nom: 'User',
                date_de_naissance: new Date('1990-01-01'),
                sexe: 'M',
                role: 'user'
            }
        });
    });

    describe('POST /api/auth/forgot-password', () => {
        it('should generate a reset token for a valid email', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test-recovery@example.com' });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');

            // Verify token is stored in DB
            const updatedUser = await prisma.users.findUnique({
                where: { id_user: testUser.id_user }
            });

            expect(updatedUser.reset_token).toBeDefined();
            expect(updatedUser.reset_token_expires).toBeDefined();
        });

        it('should return 200 even if email does not exist (security)', async () => {
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');
        });

        it('should validate email format', async () => {
            // Depending on implementation, might return 400 or handle it
            // Assuming basic validation is in place
            const res = await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: '' }); // Empty email

            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/reset-password', () => {
        it('should reset password with valid token', async () => {
            // 1. Request token
            await request(app)
                .post('/api/auth/forgot-password')
                .send({ email: 'test-recovery@example.com' });

            // 2. Get token from DB (mocking email reception)
            const userWithToken = await prisma.users.findUnique({
                where: { id_user: testUser.id_user }
            });

            // Note: In our implementation, we store the HASH of the token, but send the RAW token.
            // Since we can't easily reverse the hash or capture the raw token from the mocked email service 
            // without intercepting console.log or mocking the crypto, 
            // for this integration test, we will MANUALLY set a known token and hash in the DB to test the reset endpoint specifically.

            const crypto = require('crypto');
            const rawToken = 'my-secret-token-123';
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expires = new Date(Date.now() + 15 * 60 * 1000);

            await prisma.users.update({
                where: { id_user: testUser.id_user },
                data: {
                    reset_token: hashedToken,
                    reset_token_expires: expires
                }
            });

            // 3. Reset Password
            const newPassword = 'NewPassword789!';
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: rawToken,
                    password: newPassword
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('success');

            // 4. Verify login with new password
            const loginRes = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'test-recovery@example.com',
                    password: newPassword
                });

            expect(loginRes.statusCode).toBe(200);
            expect(loginRes.body.data.token).toBeDefined();
        });

        it('should reject expired tokens', async () => {
            const crypto = require('crypto');
            const rawToken = 'expired-token';
            const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
            // Expires in the past
            const expires = new Date(Date.now() - 1000);

            await prisma.users.update({
                where: { id_user: testUser.id_user },
                data: {
                    reset_token: hashedToken,
                    reset_token_expires: expires
                }
            });

            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: rawToken,
                    password: 'NewPassword123'
                });

            expect(res.statusCode).toBe(400);
        });

        it('should reject invalid tokens', async () => {
            const res = await request(app)
                .post('/api/auth/reset-password')
                .send({
                    token: 'invalid-token-string',
                    password: 'NewPassword123'
                });

            expect(res.statusCode).toBe(400);
        });
    });
});
