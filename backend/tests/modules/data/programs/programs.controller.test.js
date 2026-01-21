const programsController = require('../../../../src/modules/data/programs/programs.controller');
const programsService = require('../../../../src/modules/data/programs/programs.service');
const { AppError } = require('../../../../src/utils/response.utils');

// Mock dependencies
jest.mock('../../../../src/modules/data/programs/programs.service');

describe('Programs Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {},
            user: { id_user: 1 }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe('getPrograms', () => {
        it('should return user programs with pagination', async () => {
            const mockResult = { programs: [], total: 0 };
            programsService.getUserPrograms.mockResolvedValue(mockResult);

            await programsController.getPrograms(req, res, next);

            expect(programsService.getUserPrograms).toHaveBeenCalledWith(1, 1, 10, null);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'success',
                data: mockResult
            }));
        });

        it('should handle query parameters', async () => {
            req.query = { page: '2', limit: '5', tagId: '3' };
            programsService.getUserPrograms.mockResolvedValue({});

            await programsController.getPrograms(req, res, next);

            expect(programsService.getUserPrograms).toHaveBeenCalledWith(1, 2, 5, '3');
        });

        it('should handle errors', async () => {
            const error = new Error('Service error');
            programsService.getUserPrograms.mockRejectedValue(error);
            await programsController.getPrograms(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('getProgramDetails', () => {
        it('should return program details', async () => {
            req.params.programId = '123';
            const mockProgram = { id: 123, name: 'Test Program' };
            programsService.getProgramDetails.mockResolvedValue(mockProgram);

            await programsController.getProgramDetails(req, res, next);

            expect(programsService.getProgramDetails).toHaveBeenCalledWith(1, 123);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: { program: mockProgram }
            }));
        });

        it('should throw error for invalid programId', async () => {
            req.params.programId = 'invalid';
            await programsController.getProgramDetails(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe('ID de programme invalide');
        });
    });

    describe('startProgram', () => {
        it('should start a program', async () => {
            req.params.programId = '123';
            req.body.startDate = '2024-01-01';
            const mockUserProgram = { id: 1, programId: 123 };
            programsService.startProgram.mockResolvedValue(mockUserProgram);

            await programsController.startProgram(req, res, next);

            expect(programsService.startProgram).toHaveBeenCalledWith(1, 123, '2024-01-01');
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: { userProgram: mockUserProgram }
            }));
        });

        it('should throw error for invalid programId', async () => {
            req.params.programId = 'invalid';
            await programsController.startProgram(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe('ID de programme invalide');
        });
    });

    describe('getSessions', () => {
        it('should return sessions', async () => {
            const mockResult = { sessions: [] };
            programsService.getUserSessions.mockResolvedValue(mockResult);

            await programsController.getSessions(req, res, next);

            expect(programsService.getUserSessions).toHaveBeenCalledWith(1, 10, null);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: mockResult
            }));
        });
    });

    describe('getSessionDetails', () => {
        it('should return session details', async () => {
            req.params.sessionId = '456';
            const mockSession = { id: 456, name: 'Test Session' };
            programsService.getSessionDetails.mockResolvedValue(mockSession);

            await programsController.getSessionDetails(req, res, next);

            expect(programsService.getSessionDetails).toHaveBeenCalledWith(456);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: { session: mockSession }
            }));
        });

        it('should throw error for invalid sessionId', async () => {
            req.params.sessionId = 'invalid';
            await programsController.getSessionDetails(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe('ID de séance invalide');
        });
    });

    describe('getSportProgress', () => {
        it('should return sport progress', async () => {
            const mockProgress = { completedSessions: 5 };
            programsService.getSportProgress.mockResolvedValue(mockProgress);

            await programsController.getSportProgress(req, res, next);

            expect(programsService.getSportProgress).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: mockProgress
            }));
        });
    });

    describe('completeSession', () => {
        it('should complete a session', async () => {
            req.params.sessionId = '456';
            req.body.date = '2024-01-01';
            const mockCompleted = { id: 1, sessionId: 456 };
            programsService.completeSession.mockResolvedValue(mockCompleted);

            await programsController.completeSession(req, res, next);

            expect(programsService.completeSession).toHaveBeenCalledWith(1, 456, '2024-01-01');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: { completedSession: mockCompleted }
            }));
        });

        it('should throw error for invalid sessionId', async () => {
            req.params.sessionId = 'invalid';
            await programsController.completeSession(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(AppError));
            expect(next.mock.calls[0][0].message).toBe('ID de séance invalide');
        });
    });

    describe('getTodaySession', () => {
        it('should return today session', async () => {
            const mockSession = { id: 1, name: 'Today Session' };
            programsService.getTodaySession.mockResolvedValue(mockSession);

            await programsController.getTodaySession(req, res, next);

            expect(programsService.getTodaySession).toHaveBeenCalledWith(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: { todaySession: mockSession }
            }));
        });

        it('should handle no session today', async () => {
            programsService.getTodaySession.mockResolvedValue(null);

            await programsController.getTodaySession(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: { todaySession: null },
                message: "Aucune séance prévue aujourd'hui"
            }));
        });

        it('should handle errors', async () => {
            const error = new Error('Database error');
            programsService.getTodaySession.mockRejectedValue(error);
            await programsController.getTodaySession(req, res, next);
            expect(next).toHaveBeenCalledWith(error);
        });
    });
});
