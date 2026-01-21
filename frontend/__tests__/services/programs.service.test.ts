import programsService from '../../services/programs.service';
import apiService from '../../services/api.service';
import cacheService, { CACHE_KEYS } from '../../services/cache.service';

// Mock apiService
jest.mock('../../services/api.service');
jest.mock('../../services/cache.service');

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
            expect(cacheService.save).toHaveBeenCalledWith(CACHE_KEYS.PROGRAMS_PAGE, response);
            expect(result).toEqual(response);
        });

        it('gets programs with custom params', async () => {
            const response = { programs: [], recommendedPrograms: [], pagination: {} };
            (apiService.get as jest.Mock).mockResolvedValue(response);

            const result = await programsService.getPrograms(2, 20, 5);

            expect(apiService.get).toHaveBeenCalledWith('/data/programs?page=2&limit=20&tagId=5');
            expect(result).toEqual(response);
        });

        it('handles error gracefully and returns cache if available', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
            const cachedResponse = { programs: [{ id: 1 }], recommendedPrograms: [], pagination: {} };
            // Mock cache hit
            (cacheService.get as jest.Mock).mockReturnValue(Promise.resolve(cachedResponse));

            const result = await programsService.getPrograms();

            expect(result).toEqual(cachedResponse);
            expect(console.error).toHaveBeenCalled();
        });

        it('returns empty if error and no cache', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
            (cacheService.get as jest.Mock).mockReturnValue(Promise.resolve(null));

            const result = await programsService.getPrograms();

            // Resultat attendu: structure vide
            expect(result.programs).toEqual([]);
        });
    });

    describe('getSportProgress', () => {
        it('gets sport progress and caches it', async () => {
            const response = { activeProgram: { id: 1 }, weeklySchedule: [] };
            (apiService.get as jest.Mock).mockResolvedValue(response);

            const result = await programsService.getSportProgress();

            expect(apiService.get).toHaveBeenCalledWith('/data/programs/sport-progress');
            expect(cacheService.save).toHaveBeenCalledWith(CACHE_KEYS.SPORT_PROGRESS, response);
            expect(result).toEqual(response);
        });

        it('returns cached progress on error', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
            const cachedResponse = { activeProgram: { id: 1 }, weeklySchedule: [] };
            (cacheService.get as jest.Mock).mockResolvedValue(cachedResponse);

            const result = await programsService.getSportProgress();

            expect(result).toEqual(cachedResponse);
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
            (cacheService.get as jest.Mock).mockReturnValue(Promise.resolve(null));
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
            (cacheService.get as jest.Mock).mockReturnValue(Promise.resolve(null));
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
            const response = { activeProgram: { id: 1 }, weeklySchedule: [] };
            (apiService.get as jest.Mock).mockResolvedValue(response);

            const result = await programsService.getActiveUserProgram();

            expect(apiService.get).toHaveBeenCalledWith('/data/programs/sport-progress');
            expect(result).toEqual(response.activeProgram);
        });

        it('handles error gracefully', async () => {
            (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
            (cacheService.get as jest.Mock).mockReturnValue(Promise.resolve(null));

            const result = await programsService.getActiveUserProgram();

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalled();
        });
    });
});
