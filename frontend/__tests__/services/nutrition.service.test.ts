import { nutritionService, openFoodFactsService } from '../../services/nutrition.service';
import apiService from '../../services/api.service';

// Mock apiService
jest.mock('../../services/api.service');

describe('nutritionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('gets all foods', async () => {
        const response = { foods: [], pagination: {} };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await nutritionService.getAllFoods({ search: 'apple' });

        expect(apiService.get).toHaveBeenCalledWith('/nutrition?search=apple');
        expect(result).toEqual(response);
    });

    it('gets food by id', async () => {
        const response = { id: 1, name: 'Apple' };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await nutritionService.getFoodById(1);

        expect(apiService.get).toHaveBeenCalledWith('/nutrition/1');
        expect(result).toEqual(response);
    });

    it('gets nutrition summary', async () => {
        const response = { calorieGoal: 2000 };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await nutritionService.getNutritionSummary();

        expect(apiService.get).toHaveBeenCalledWith('/nutrition/user/summary');
        expect(result).toEqual(response);
    });

    it('gets today nutrition', async () => {
        const response = { date: '2023-01-01' };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await nutritionService.getTodayNutrition();

        expect(apiService.get).toHaveBeenCalledWith('/nutrition/user/today');
        expect(result).toEqual(response);
    });

    it('logs nutrition', async () => {
        const data = { foodId: 1, quantity: 100, meal: 'breakfast' };
        const response = { id: 1, ...data };
        (apiService.post as jest.Mock).mockResolvedValue(response);

        const result = await nutritionService.logNutrition(1, 100, 'breakfast');

        expect(apiService.post).toHaveBeenCalledWith('/nutrition/user/log', { ...data, date: undefined });
        expect(result).toEqual(response);
    });

    it('deletes nutrition entry', async () => {
        (apiService.delete as jest.Mock).mockResolvedValue({});

        await nutritionService.deleteNutritionEntry(1);

        expect(apiService.delete).toHaveBeenCalledWith('/nutrition/user/log/1');
    });

    it('gets nutrition history', async () => {
        const response = { history: [] };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await nutritionService.getNutritionHistory('2023-01-01', '2023-01-07');

        expect(apiService.get).toHaveBeenCalledWith('/nutrition/user/history?startDate=2023-01-01&endDate=2023-01-07');
        expect(result).toEqual(response);
    });
    it('handles getAllFoods error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(nutritionService.getAllFoods()).rejects.toThrow('Error');
    });

    it('handles getFoodById error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(nutritionService.getFoodById(1)).rejects.toThrow('Error');
    });

    it('handles getNutritionSummary error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(nutritionService.getNutritionSummary()).rejects.toThrow('Error');
    });

    it('handles getTodayNutrition error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(nutritionService.getTodayNutrition()).rejects.toThrow('Error');
    });

    it('handles logNutrition error', async () => {
        (apiService.post as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(nutritionService.logNutrition(1, 100, 'breakfast')).rejects.toThrow('Error');
    });

    it('handles deleteNutritionEntry error', async () => {
        (apiService.delete as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(nutritionService.deleteNutritionEntry(1)).rejects.toThrow('Error');
    });

    it('handles getNutritionHistory error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(nutritionService.getNutritionHistory()).rejects.toThrow('Error');
    });

    it('buildQueryString handles empty params', async () => {
        // Indirectly testing buildQueryString via public methods
        (apiService.get as jest.Mock).mockResolvedValue({});
        await nutritionService.getAllFoods({});
        expect(apiService.get).toHaveBeenCalledWith('/nutrition');
    });

    it('buildQueryString handles null/undefined params', async () => {
        (apiService.get as jest.Mock).mockResolvedValue({});
        // @ts-ignore
        await nutritionService.getAllFoods({ search: null, page: undefined, limit: 10 });
        expect(apiService.get).toHaveBeenCalledWith('/nutrition?limit=10');
    });
});

describe('openFoodFactsService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('gets product by barcode', async () => {
        const response = { name: 'Product' };
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await openFoodFactsService.getProductByBarcode('123456');

        expect(apiService.get).toHaveBeenCalledWith('/openfoodfacts/product/123456');
        expect(result).toEqual(response);
    });

    it('handles getProductByBarcode error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(openFoodFactsService.getProductByBarcode('123')).rejects.toThrow('Error');
    });

    it('searches products', async () => {
        const response = [{ name: 'Product' }];
        (apiService.get as jest.Mock).mockResolvedValue(response);

        const result = await openFoodFactsService.searchProducts('query');

        expect(apiService.get).toHaveBeenCalledWith('/openfoodfacts/search?query=query&limit=10');
        expect(result).toEqual(response);
    });

    it('handles searchProducts error', async () => {
        (apiService.get as jest.Mock).mockRejectedValue(new Error('Error'));
        await expect(openFoodFactsService.searchProducts('query')).rejects.toThrow('Error');
    });
});
