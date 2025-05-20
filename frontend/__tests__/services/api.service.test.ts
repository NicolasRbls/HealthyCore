// __tests__/services/api.service.test.ts
import apiService from '../../services/api.service';

// Mock SecureStore manually
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve('test-token')),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Import SecureStore AFTER mocking it
import * as SecureStore from 'expo-secure-store';

describe('API Service', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Reset fetch mock
    global.fetch = jest.fn();

    // Make sure the SecureStore mock returns a token
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-token');
  });

  it('performs GET requests correctly', async () => {
    // Mock a successful API response
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        data: { id: 1, name: 'Test' }
      })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await apiService.get('/test-endpoint');
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test-endpoint'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.any(Headers)
      })
    );
    expect(result).toEqual({ id: 1, name: 'Test' });

    // Verify SecureStore was called
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('token');
  });

  it('performs POST requests with correct body', async () => {
    const mockData = { name: 'Test', value: 42 };
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        status: 'success',
        data: { id: 123, ...mockData }
      })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

    const result = await apiService.post('/create', mockData);
    
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/create'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(mockData),
        headers: expect.any(Headers)
      })
    );
    expect(result).toEqual({ id: 123, ...mockData });
  });

  it('handles API errors correctly', async () => {
    const mockErrorResponse = {
      ok: false,
      status: 404,
      json: () => Promise.resolve({
        message: 'Resource not found',
        code: 'NOT_FOUND'
      })
    };
    (global.fetch as jest.Mock).mockResolvedValue(mockErrorResponse);
    
    try {
      await apiService.get('/not-found');
      // Should not reach here
      fail('API request should have failed');
    } catch (error: any) {
      expect(error).toMatchObject({
        message: 'Resource not found',
        code: 'NOT_FOUND',
        status: 404
      });
    }
  });
});