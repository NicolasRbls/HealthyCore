const request = require('supertest');
const app = require('../../../src/app');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const OpenFoodFactsService = require('../../../src/modules/openfoodfacts/openfoodfacts.service');

// Mock the service to isolate route tests
jest.mock('../../../src/modules/openfoodfacts/openfoodfacts.service');

describe('OpenFoodFacts Routes', () => {
    let token;
    let testUser;

    beforeAll(async () => {
        // Create a test user for authentication
        testUser = await prisma.users.create({
            data: {
                prenom: 'OFF',
                nom: 'Test',
                email: 'off-test@example.com',
                mot_de_passe: 'password123',
                sexe: 'M',
                date_de_naissance: new Date('1990-01-01'),
            },
        });

        // Generate a token for the created user
        token = jwt.sign({ userId: testUser.id_user, email: testUser.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    });

    afterAll(async () => {
        // Clean up the test user
        if (testUser) {
            await prisma.users.delete({ where: { id_user: testUser.id_user } });
        }
        await prisma.$disconnect();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/openfoodfacts/search', () => {
        it('should call the searchProducts service and return products', async () => {
            const mockProducts = [{ name: 'Test Product' }];
            OpenFoodFactsService.searchProducts.mockResolvedValue(mockProducts);

            const res = await request(app)
                .get('/api/openfoodfacts/search?query=test')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.status).toBe('success');
            expect(OpenFoodFactsService.searchProducts).toHaveBeenCalledWith('test', 10);
            expect(res.body.data).toEqual(mockProducts);
        });

        it('should return 400 if query is missing', async () => {
            const res = await request(app)
                .get('/api/openfoodfacts/search')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(400);
        });
    });

    describe('GET /api/openfoodfacts/product/:barcode', () => {
        it('should call the getProductByBarcode service and return a product', async () => {
            const mockProduct = { data: { name: 'Barcode Product' }, status: 'success' };
            OpenFoodFactsService.getProductByBarcode.mockResolvedValue(mockProduct);

            const res = await request(app)
                .get('/api/openfoodfacts/product/123456789')
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.statusCode).toEqual(200);
            expect(OpenFoodFactsService.getProductByBarcode).toHaveBeenCalledWith('123456789');
            expect(res.body.data).toEqual(mockProduct);
        });

        it('should return 404 if product is not found', async () => {
            OpenFoodFactsService.getProductByBarcode.mockResolvedValue({ status: 'fail' });

            const res = await request(app)
                .get('/api/openfoodfacts/product/00000')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toEqual(404);
        });
    });
});