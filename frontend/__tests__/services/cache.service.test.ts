import cacheService, { CACHE_KEYS } from '../../services/cache.service';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage is already handled by jest.setup.js but we can override implementations locally
describe('CacheService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('save', () => {
        it('should save data successfully', async () => {
            const data = { foo: 'bar' };
            await cacheService.save('test_key', data);

            expect(AsyncStorage.setItem).toHaveBeenCalledWith('test_key', JSON.stringify(data));
        });

        it('should log error when save fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage Error'));

            await cacheService.save('test_key', {});

            expect(consoleSpy).toHaveBeenCalledWith('Error saving data to cache', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('get', () => {
        it('should retrieve and parse data successfully', async () => {
            const data = { foo: 'bar' };
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(data));

            const result = await cacheService.get('test_key');
            expect(result).toEqual(data);
        });

        it('should return null if item does not exist', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

            const result = await cacheService.get('test_key');
            expect(result).toBeNull();
        });

        it('should return null and log error if parsing fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json');

            const result = await cacheService.get('test_key');

            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('Error reading data from cache', expect.any(Error));
            consoleSpy.mockRestore();
        });

        it('should return null and log error if getItem fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Read Error'));

            const result = await cacheService.get('test_key');

            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalledWith('Error reading data from cache', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('remove', () => {
        it('should remove item successfully', async () => {
            await cacheService.remove('test_key');
            expect(AsyncStorage.removeItem).toHaveBeenCalledWith('test_key');
        });

        it('should log error if remove fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Remove Error'));

            await cacheService.remove('test_key');

            expect(consoleSpy).toHaveBeenCalledWith('Error removing data from cache', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('clearAll', () => {
        it('should clear all known keys', async () => {
            await cacheService.clearAll();
            expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(Object.values(CACHE_KEYS));
        });

        it('should log error if clearAll fails', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
            (AsyncStorage.multiRemove as jest.Mock).mockRejectedValue(new Error('Clear Error'));

            await cacheService.clearAll();

            expect(consoleSpy).toHaveBeenCalledWith('Error clearing cache', expect.any(Error));
            consoleSpy.mockRestore();
        });
    });

    describe('Sync wrapper', () => {
        it('setLastSync should save date', async () => {
            await cacheService.setLastSync('2023-01-01');
            expect(AsyncStorage.setItem).toHaveBeenCalledWith(CACHE_KEYS.LAST_SYNC, JSON.stringify('2023-01-01'));
        });

        it('getLastSync should retrieve date', async () => {
            (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify('2023-01-01'));
            const date = await cacheService.getLastSync();
            expect(date).toBe('2023-01-01');
        });
    });
});
