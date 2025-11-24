const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const OpenFoodFactsService = require('../../../src/modules/openfoodfacts/openfoodfacts.service');

// Mock dependencies
jest.mock('axios');
jest.mock('@prisma/client', () => {
    const mPrismaClient = {
        aliments: {
            findFirst: jest.fn(),
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            findUnique: jest.fn(),
        },
        tags: {
            findFirst: jest.fn(),
            create: jest.fn(),
        },
        aliments_tags: {
            findFirst: jest.fn(),
            create: jest.fn(),
        }
    };
    return { PrismaClient: jest.fn(() => mPrismaClient) };
});

let prisma;

describe('OpenFoodFacts Service', () => {

    beforeEach(() => {
        prisma = new PrismaClient();
        jest.clearAllMocks();
    });

    describe('getProductByBarcode', () => {
        it('should return a product from the local database if it exists', async () => {
            const mockProduct = { id_aliment: 1, code_barres: '12345', nom: 'Local Product', aliments_tags: [] };
            prisma.aliments.findFirst.mockResolvedValue(mockProduct);

            const result = await OpenFoodFactsService.getProductByBarcode('12345');

            expect(prisma.aliments.findFirst).toHaveBeenCalledWith({ where: { code_barres: '12345' }, include: expect.any(Object) });
            expect(axios.get).not.toHaveBeenCalled();
            expect(result.status).toBe('success');
            expect(result.data.name).toBe('Local Product');
        });

        it('should fetch from API if not in local DB and save it', async () => {
            const barcode = '54321';
            const apiProduct = {
                code: barcode,
                product_name: 'API Product',
                nutriments: { 'energy-kcal_100g': 200 },
            };
            const savedProduct = { id_aliment: 2, code_barres: barcode, nom: 'API Product', aliments_tags: [] };

            prisma.aliments.findFirst.mockResolvedValue(null);
            axios.get.mockResolvedValue({ data: { status: 1, product: apiProduct } });
            prisma.aliments.create.mockResolvedValue(savedProduct); // Mock the final creation
            prisma.aliments.findUnique.mockResolvedValue(savedProduct); // Mock the re-fetch after save

            const result = await OpenFoodFactsService.getProductByBarcode(barcode);

            expect(axios.get).toHaveBeenCalled();
            expect(prisma.aliments.create).toHaveBeenCalled();
            expect(result.status).toBe('success');
            expect(result.data.name).toBe('API Product');
        });

        it('should return fail status if product is not found anywhere', async () => {
            prisma.aliments.findFirst.mockResolvedValue(null);
            axios.get.mockResolvedValue({ data: { status: 0 } });

            const result = await OpenFoodFactsService.getProductByBarcode('00000');

            expect(result.status).toBe('fail');
        });
    });

    describe('searchProducts', () => {
        it('should return only local products if enough are found', async () => {
            const mockLocalProducts = Array(5).fill(0).map((_, i) => ({ id_aliment: i, nom: `Local ${i}`, aliments_tags: [] }));
            prisma.aliments.findMany.mockResolvedValue(mockLocalProducts);

            const results = await OpenFoodFactsService.searchProducts('query', 5);

            expect(results.length).toBe(5);
            expect(axios.get).not.toHaveBeenCalled();
        });

        it('should supplement local results with API results', async () => {
            const mockLocalProducts = [{ id_aliment: 1, nom: 'Local 1', aliments_tags: [] }];
            const apiResponse = {
                products: [
                    { code: '111', product_name: 'API 1', nutriments: {} },
                    { code: '222', product_name: 'API 2', nutriments: {} },
                ]
            };
             const savedProduct = { id_aliment: 2, nom: 'API 1', aliments_tags: [] };

            prisma.aliments.findMany.mockResolvedValue(mockLocalProducts);
            axios.get.mockResolvedValue({ data: apiResponse });
            // Mock the save function calls
            prisma.aliments.findFirst.mockResolvedValue(null);
            prisma.aliments.create.mockResolvedValue(savedProduct);
            prisma.aliments.findUnique.mockResolvedValue(savedProduct);

            const results = await OpenFoodFactsService.searchProducts('query', 3);

            expect(results.length).toBe(3);
            expect(axios.get).toHaveBeenCalled();
            expect(results[0].name).toBe('Local 1');
            expect(results[1].name).toBe('API 1');
        });
    });

    describe('saveProductFromOpenFoodFacts', () => {
        it('should format and save a product correctly', async () => {
            const apiProduct = {
                code: '999',
                product_name: 'Full Product',
                brands: 'Brand',
                quantity: '500g',
                nutriments: {
                    'energy-kcal_100g': 300,
                    proteins_100g: 10,
                    carbohydrates_100g: 20,
                    fat_100g: 15,
                },
                categories_tags: ['dairies', 'cheeses'] // Corrected: no colons
            };
            const expectedSavedName = 'Full Product - Brand - 500g';
            const savedProduct = { id_aliment: 99, nom: expectedSavedName, code_barres: '999', aliments_tags: [] };

            prisma.aliments.findFirst.mockResolvedValue(null); // It does not exist
            prisma.aliments.create.mockResolvedValue(savedProduct);
            prisma.tags.findFirst.mockResolvedValue(null); // Tags don't exist
            prisma.tags.create.mockResolvedValue({id_tag: 1}); // Create tags
            prisma.aliments_tags.findFirst.mockResolvedValue(null); // Association doesn't exist
            prisma.aliments_tags.create.mockResolvedValue({});
            // The service re-fetches the product after saving, so we need to mock that findUnique call
            prisma.aliments.findUnique.mockResolvedValue(savedProduct);


            await OpenFoodFactsService.saveProductFromOpenFoodFacts(apiProduct);

            expect(prisma.aliments.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    nom: expectedSavedName,
                    calories: 300,
                    proteines: "10.0",
                })
            });
            // Check if tag creation was attempted
            expect(prisma.tags.create).toHaveBeenCalled();
        });
    });

});
