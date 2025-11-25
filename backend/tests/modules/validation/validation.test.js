const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { 
    validateEmailCheck, 
    validateProfileData, 
    validatePhysicalDataFuture 
} = require('../../../src/modules/validation/validation.validators');
const errorMiddleware = require('../../../src/middleware/error.middleware');

// Setup a mini express app to test middleware in isolation
const app = express();
app.use(bodyParser.json());

// Create test routes for each validator
app.post('/test-email', validateEmailCheck, (req, res) => res.status(200).send('OK'));
app.post('/test-profile', validateProfileData, (req, res) => res.status(200).send('OK'));
app.post('/test-physical', validatePhysicalDataFuture, (req, res) => res.status(200).send('OK'));

// Use the app's error handler
app.use(errorMiddleware);

describe('Validation Middlewares', () => {

    describe('validateEmailCheck', () => {
        it('should return 400 if email is empty', async () => {
            const res = await request(app).post('/test-email').send({ email: '' });
            expect(res.statusCode).toBe(400);
            expect(res.body.errors.email).toContain("L'email est requis");
        });

        it('should return 400 if email is invalid', async () => {
            const res = await request(app).post('/test-email').send({ email: 'invalid-email' });
            expect(res.statusCode).toBe(400);
            expect(res.body.errors.email).toContain("Format d'email invalide");
        });

        it('should return 200 if email is valid', async () => {
            const res = await request(app).post('/test-email').send({ email: 'test@example.com' });
            expect(res.statusCode).toBe(200);
        });
    });

    describe('validateProfileData', () => {
        it('should return 400 for invalid first name', async () => {
            const res = await request(app).post('/test-profile').send({ firstName: '123' });
            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toHaveProperty('firstName', 'Format de prénom invalide');
        });

        it('should return 400 for password shorter than 8 characters', async () => {
            const res = await request(app).post('/test-profile').send({ 
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: '123' 
            });
            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toHaveProperty('password', 'Le mot de passe doit contenir au moins 8 caractères');
        });

        it('should return 200 for valid profile data', async () => {
            const res = await request(app).post('/test-profile').send({ 
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@doe.com',
                password: 'password123'
            });
            expect(res.statusCode).toBe(200);
        });
    });

    describe('validatePhysicalDataFuture', () => {
        it('should return 400 for invalid gender', async () => {
            const res = await request(app).post('/test-physical').send({ gender: 'X' });
            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toHaveProperty('gender', 'Genre invalide');
        });

        it('should return 400 for invalid weight', async () => {
            const res = await request(app).post('/test-physical').send({ 
                gender: 'H',
                birthDate: '1990-01-01',
                weight: 999,
                height: 180
             });
            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toHaveProperty('weight', 'Poids invalide (doit être inférieur à 500kg)');
        });

         it('should return 400 for invalid height', async () => {
            const res = await request(app).post('/test-physical').send({ 
                gender: 'H',
                birthDate: '1990-01-01',
                weight: 80,
                height: 999
             });
            expect(res.statusCode).toBe(400);
            expect(res.body.errors).toHaveProperty('height', 'Taille invalide (doit être inférieure à 300cm)');
        });

        it('should return 200 for valid physical data', async () => {
            const res = await request(app).post('/test-physical').send({ 
                gender: 'F',
                birthDate: '1995-05-05',
                weight: 60,
                height: 165
             });
            expect(res.statusCode).toBe(200);
        });
    });
});
