import programsService from '../../services/programs.service';
import apiService from '../../services/api.service';

// Mock apiService
jest.mock('../../services/api.service');

describe('programsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        (console.error as jest.Mock).mockRestore();
    });

    describe('getPrograms', () => {
        it('gets programs with default params', async () => {
            const response = { programs: [], recommendedPrograms: [], pagination: {} };
            (apiService.get as jest.Mock).mockResolvedValue(response);

            const result = await programsService.getPrograms();

            expect(apiService.get).toHaveBeenCalledWith('/data/programs?page=1&limit=10');
            expect(result).toEqual(response);
        });

        it('gets programs with custom params', async () => {
            const response = { programs: [], recommendedPrograms: [], pagination: {} };
            (apiService.get as jest.Mock).mockResolvedValue(response);

            const result = await programsService.getPrograms(2, 20, 5);

            expect(apiService.get).toHaveBeenCalledWith('/data/programs?page=2&limit=20&tagId=5');
            expect(result).toEqual(response);
        });

        it('handles error gracefully', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));

            const result = await programsService.getPrograms();

            expect(result).toEqual({
                recommendedPrograms: [],
                programs: [],
                pagination: {
                    total: 0,
                    totalPages: 0,
                    currentPage: 1,
                    limit: 10,
                },
            });
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('getProgramDetails', () => {
        it('gets program details', async () => {
            const response = { program: { id: 1 } };
            (apiService.get as jest.Mock).mockResolvedValue(response);

            const result = await programsService.getProgramDetails(1);

            expect(apiService.get).toHaveBeenCalledWith('/data/programs/1');
            expect(result).toEqual(response.program);
        });

        it('handles error', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
            await expect(programsService.getProgramDetails(1)).rejects.toThrow('Error');
        });
    });

    describe('startProgram', () => {
        it('starts program without date', async () => {
            const response = { userProgram: { id: 1 } };
            (apiService.post as jest.Mock).mockResolvedValue(response);

            const result = await programsService.startProgram(1);

            expect(apiService.post).toHaveBeenCalledWith('/data/programs/1/start', {});
            expect(result).toEqual(response.userProgram);
        });

        it('starts program with date', async () => {
            const response = { userProgram: { id: 1 } };
            (apiService.post as jest.Mock).mockResolvedValue(response);

            const result = await programsService.startProgram(1, '2023-01-01');

            expect(apiService.post).toHaveBeenCalledWith('/data/programs/1/start', { startDate: '2023-01-01' });
            expect(result).toEqual(response.userProgram);
        });

        it('handles error', async () => {
            (apiService.post as jest.Mock).mockRejectedValue(new Error('Error'));
            await expect(programsService.startProgram(1)).rejects.toThrow('Error');
        });
    });

    describe('getSessionDetails', () => {
        it('gets session details', async () => {
            const response = { session: { id: 1 } };
            (apiService.get as jest.Mock).mockResolvedValue(response);

            const result = await programsService.getSessionDetails(1);

            expect(apiService.get).toHaveBeenCalledWith('/data/programs/sessions/1');
            expect(result).toEqual(response.session);
        });

        it('handles error', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
            await expect(programsService.getSessionDetails(1)).rejects.toThrow('Error');
        });
    });

    describe('completeSession', () => {
        it('completes session without date', async () => {
            const response = { completedSession: { id: 1 } };
            (apiService.post as jest.Mock).mockResolvedValue(response);

            const result = await programsService.completeSession(1);

            expect(apiService.post).toHaveBeenCalledWith('/data/programs/sessions/1/complete', {});
            expect(result).toEqual(response.completedSession);
        });

        it('completes session with date', async () => {
            const response = { completedSession: { id: 1 } };
            (apiService.post as jest.Mock).mockResolvedValue(response);

            const result = await programsService.completeSession(1, '2023-01-01');

            expect(apiService.post).toHaveBeenCalledWith('/data/programs/sessions/1/complete', { date: '2023-01-01' });
            expect(result).toEqual(response.completedSession);
        });

        it('handles error', async () => {
            (apiService.post as jest.Mock).mockRejectedValue(new Error('Error'));
            await expect(programsService.completeSession(1)).rejects.toThrow('Error');
        });
    });

    describe('getActiveUserProgram', () => {
        it('gets active user program', async () => {
            const response = { activeProgram: { id: 1 } };
            (apiService.get as jest.Mock).mockResolvedValue(response);

            const result = await programsService.getActiveUserProgram();

            expect(apiService.get).toHaveBeenCalledWith('/data/programs/sport-progress');
            expect(result).toEqual(response.activeProgram);
        });

        it('handles error gracefully', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));

            const result = await programsService.getActiveUserProgram();

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalled();
        });
    });
});
