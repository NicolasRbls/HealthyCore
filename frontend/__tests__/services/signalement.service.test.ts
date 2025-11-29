import signalementService from '../../services/signalement.service';
import apiService from '../../services/api.service';

jest.mock('../../services/api.service');

describe('signalementService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getTypes', () => {
        it('fetches types successfully', async () => {
            const mockTypes = [{ id_signalement: 1, titre: 'Error' }];
            (apiService.get as jest.Mock).mockResolvedValue(mockTypes);

            const result = await signalementService.getTypes();

            expect(apiService.get).toHaveBeenCalledWith('/signalements/types');
            expect(result).toEqual(mockTypes);
        });
    });

    describe('create', () => {
        it('creates signalement successfully', async () => {
            const mockData = { id_signalement: 1, id_aliment: 1, description: 'Test' };
            const mockResponse = { success: true };
            (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

            const result = await signalementService.create(mockData);

            expect(apiService.post).toHaveBeenCalledWith('/signalements', mockData);
            expect(result).toEqual(mockResponse);
        });
    });
});
