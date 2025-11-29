import programsService from '../../services/programs.service';
import apiService from '../../services/api.service';

jest.mock('../../services/api.service');

describe('programsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getPrograms', () => {
        it('fetches programs successfully', async () => {
            const mockResponse = {
                programs: [],
                recommendedPrograms: [],
                pagination: { total: 0, totalPages: 0, currentPage: 1, limit: 10 },
            };
            (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

            const result = await programsService.getPrograms();

            expect(apiService.get).toHaveBeenCalledWith('/data/programs?page=1&limit=10');
            expect(result).toEqual(mockResponse);
        });

        it('fetches programs with tagId', async () => {
            const mockResponse = { programs: [], recommendedPrograms: [], pagination: {} };
            (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

            await programsService.getPrograms(1, 10, 5);

            expect(apiService.get).toHaveBeenCalledWith('/data/programs?page=1&limit=10&tagId=5');
        });

        it('handles error and returns empty response', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

            const result = await programsService.getPrograms();

            expect(result.programs).toEqual([]);
            expect(result.pagination.total).toBe(0);
        });
    });

    describe('getProgramDetails', () => {
        it('fetches program details successfully', async () => {
            const mockResponse = { program: { id: 1, name: 'Test' } };
            (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

            const result = await programsService.getProgramDetails(1);

            expect(apiService.get).toHaveBeenCalledWith('/data/programs/1');
            expect(result).toEqual(mockResponse.program);
        });

        it('throws error on failure', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

            await expect(programsService.getProgramDetails(1)).rejects.toThrow('Fetch failed');
        });
    });

    describe('startProgram', () => {
        it('starts program successfully', async () => {
            const mockResponse = { userProgram: { id: 1, status: 'active' } };
            (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

            const result = await programsService.startProgram(1, '2023-01-01');

            expect(apiService.post).toHaveBeenCalledWith('/data/programs/1/start', { startDate: '2023-01-01' });
            expect(result).toEqual(mockResponse.userProgram);
        });
    });

    describe('getSessionDetails', () => {
        it('fetches session details successfully', async () => {
            const mockResponse = { session: { id: 1, name: 'Session 1' } };
            (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

            const result = await programsService.getSessionDetails(1);

            expect(apiService.get).toHaveBeenCalledWith('/data/programs/sessions/1');
            expect(result).toEqual(mockResponse.session);
        });
    });

    describe('completeSession', () => {
        it('completes session successfully', async () => {
            const mockResponse = { completedSession: { id: 1, status: 'completed' } };
            (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

            const result = await programsService.completeSession(1, '2023-01-01');

            expect(apiService.post).toHaveBeenCalledWith('/data/programs/sessions/1/complete', { date: '2023-01-01' });
            expect(result).toEqual(mockResponse.completedSession);
        });
    });

    describe('getActiveUserProgram', () => {
        it('fetches active program successfully', async () => {
            const mockResponse = { activeProgram: { id: 1, name: 'Active' } };
            (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

            const result = await programsService.getActiveUserProgram();

            expect(apiService.get).toHaveBeenCalledWith('/data/programs/sport-progress');
            expect(result).toEqual(mockResponse.activeProgram);
        });

        it('returns null on error', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

            const result = await programsService.getActiveUserProgram();

            expect(result).toBeNull();
        });
    });
});
