const errorMiddleware = require('../../src/middleware/error.middleware');
const { Prisma } = require('@prisma/client');
const config = require('../../src/config/config');

// Mock config to control NODE_ENV
jest.mock('../../src/config/config', () => ({
    NODE_ENV: 'test',
    PORT: 3000
}));

describe('Error Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should handle Prisma P2002 error (Unique constraint violation)', () => {
        const error = new Prisma.PrismaClientKnownRequestError(
            'Unique constraint failed',
            { code: 'P2002', clientVersion: '4.0.0' }
        );

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(409);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Une ressource avec ces données existe déjà.',
            code: 'RESOURCE_CONFLICT'
        });
    });

    it('should handle Prisma P2025 error (Record not found)', () => {
        const error = new Prisma.PrismaClientKnownRequestError(
            'Record not found',
            { code: 'P2025', clientVersion: '4.0.0' }
        );

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Ressource non trouvée.',
            code: 'RESOURCE_NOT_FOUND'
        });
    });

    it('should handle other Prisma errors', () => {
        const error = new Prisma.PrismaClientKnownRequestError(
            'Some other error',
            { code: 'P9999', clientVersion: '4.0.0' }
        );

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Erreur de base de données.',
            code: 'DATABASE_ERROR'
        });
    });

    it('should handle TokenExpiredError', () => {
        const error = new Error('jwt expired');
        error.name = 'TokenExpiredError';

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Votre session a expiré. Veuillez vous reconnecter.',
            code: 'TOKEN_EXPIRED'
        });
    });

    it('should handle JsonWebTokenError', () => {
        const error = new Error('invalid token');
        error.name = 'JsonWebTokenError';

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Session invalide. Veuillez vous reconnecter.',
            code: 'INVALID_TOKEN'
        });
    });

    it('should handle ValidationError', () => {
        const error = new Error('Validation failed');
        error.name = 'ValidationError';
        error.errors = [{ msg: 'Invalid email' }];

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Validation failed',
            errors: [{ msg: 'Invalid email' }],
            code: 'VALIDATION_ERROR'
        });
    });

    it('should handle custom AppError with statusCode', () => {
        const error = new Error('Custom error');
        error.statusCode = 403;
        error.code = 'FORBIDDEN_ACCESS';

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Custom error',
            code: 'FORBIDDEN_ACCESS'
        });
    });

    it('should handle custom AppError without code', () => {
        const error = new Error('Custom error');
        error.statusCode = 400;

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Custom error',
            code: 'API_ERROR'
        });
    });

    it('should handle unknown errors (Default 500)', () => {
        const error = new Error('Something went wrong');

        errorMiddleware(error, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({
            status: 'error',
            message: 'Une erreur interne est survenue.',
            code: 'INTERNAL_SERVER_ERROR'
        });
    });

    it('should log full error in development environment', () => {
        // Temporarily change NODE_ENV
        const originalEnv = config.NODE_ENV;
        config.NODE_ENV = 'development';

        const error = new Error('Dev error');
        errorMiddleware(error, req, res, next);

        expect(console.error).toHaveBeenCalledWith('Error details:', error);

        // Restore NODE_ENV
        config.NODE_ENV = originalEnv;
    });

    it('should log simple error message in production/test environment', () => {
        // Ensure NODE_ENV is not development (mocked as 'test')
        const error = new Error('Prod error');
        errorMiddleware(error, req, res, next);

        expect(console.error).toHaveBeenCalledWith('Error: Prod error');
    });
});
