const validationMiddleware = require('../../src/middleware/validation.middleware');
const { ValidationError } = require('../../src/utils/response.utils');

describe('Validation Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {};
        next = jest.fn();
    });

    describe('validateRegistration', () => {
        it('should call next() if registration data is valid', () => {
            req.body = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123'
            };

            validationMiddleware.validateRegistration(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should call next(ValidationError) if firstName is invalid', () => {
            req.body = {
                firstName: 'John123',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'password123'
            };

            validationMiddleware.validateRegistration(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(next.mock.calls[0][0].errors).toHaveProperty('firstName');
        });

        it('should call next(ValidationError) if lastName is invalid', () => {
            req.body = {
                firstName: 'John',
                lastName: 'Doe!',
                email: 'john@example.com',
                password: 'password123'
            };

            validationMiddleware.validateRegistration(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(next.mock.calls[0][0].errors).toHaveProperty('lastName');
        });

        it('should call next(ValidationError) if email is invalid', () => {
            req.body = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'invalid-email',
                password: 'password123'
            };

            validationMiddleware.validateRegistration(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(next.mock.calls[0][0].errors).toHaveProperty('email');
        });

        it('should call next(ValidationError) if password is too short', () => {
            req.body = {
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@example.com',
                password: 'short'
            };

            validationMiddleware.validateRegistration(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(next.mock.calls[0][0].errors).toHaveProperty('password');
        });
    });

    describe('validatePhysical', () => {
        it('should call next() if physical data is valid', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 20);

            req.body = {
                gender: 'H',
                birthDate: birthDate.toISOString(),
                weight: 75,
                height: 180
            };

            validationMiddleware.validatePhysical(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should call next(ValidationError) if gender is invalid', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 20);

            req.body = {
                gender: 'X',
                birthDate: birthDate.toISOString(),
                weight: 75,
                height: 180
            };

            validationMiddleware.validatePhysical(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(next.mock.calls[0][0].errors).toHaveProperty('gender');
        });

        it('should call next(ValidationError) if too young', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 10);

            req.body = {
                gender: 'H',
                birthDate: birthDate.toISOString(),
                weight: 75,
                height: 180
            };

            validationMiddleware.validatePhysical(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(next.mock.calls[0][0].errors).toHaveProperty('birthDate');
        });

        it('should call next(ValidationError) if weight is invalid', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 20);

            req.body = {
                gender: 'H',
                birthDate: birthDate.toISOString(),
                weight: -5,
                height: 180
            };

            validationMiddleware.validatePhysical(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(next.mock.calls[0][0].errors).toHaveProperty('weight');
        });

        it('should call next(ValidationError) if height is invalid', () => {
            const birthDate = new Date();
            birthDate.setFullYear(birthDate.getFullYear() - 20);

            req.body = {
                gender: 'H',
                birthDate: birthDate.toISOString(),
                weight: 75,
                height: 350
            };

            validationMiddleware.validatePhysical(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(next.mock.calls[0][0].errors).toHaveProperty('height');
        });
    });

    describe('validateTargetWeight', () => {
        it('should call next() if target weight and current weight are valid', () => {
            req.body = {
                currentWeight: 80,
                targetWeight: 75
            };

            validationMiddleware.validateTargetWeight(req, res, next);

            expect(next).toHaveBeenCalledWith();
        });

        it('should call next(ValidationError) if target weight is invalid', () => {
            req.body = {
                currentWeight: 80,
                targetWeight: -5
            };

            validationMiddleware.validateTargetWeight(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(next.mock.calls[0][0].errors).toHaveProperty('targetWeight');
        });

        it('should call next(ValidationError) if target weight is missing', () => {
            req.body = {
                currentWeight: 80
            };

            validationMiddleware.validateTargetWeight(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(next.mock.calls[0][0].errors).toHaveProperty('targetWeight');
        });

        it('should call next(ValidationError) if current weight is missing', () => {
            req.body = {
                targetWeight: 75
            };

            validationMiddleware.validateTargetWeight(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(ValidationError));
            expect(next.mock.calls[0][0].errors).toHaveProperty('currentWeight');
        });
    });
});
