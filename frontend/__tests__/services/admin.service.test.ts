import adminService from '../../services/admin.service';
import apiService from '../../services/api.service';

jest.mock('../../services/api.service');

describe('adminService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('fetches all users successfully', async () => {
            const mockUsers = [{ id: 1, firstName: 'John' }];
            (apiService.get as jest.Mock).mockResolvedValue(mockUsers);

            const result = await adminService.getAllUsers();

            expect(apiService.get).toHaveBeenCalledWith('/admin/users');
            expect(result).toEqual(mockUsers);
        });
    });

    describe('getUserById', () => {
        it('fetches user by id successfully', async () => {
            const mockUser = { id: 1, firstName: 'John' };
            (apiService.get as jest.Mock).mockResolvedValue(mockUser);

            const result = await adminService.getUserById(1);

            expect(apiService.get).toHaveBeenCalledWith('/admin/users/1');
            expect(result).toEqual(mockUser);
        });
    });

    describe('updateUser', () => {
        it('updates user successfully', async () => {
            const mockUser = { id: 1, firstName: 'Jane' };
            const updateData = { firstName: 'Jane' };
            (apiService.put as jest.Mock).mockResolvedValue(mockUser);

            const result = await adminService.updateUser(1, updateData);

            expect(apiService.put).toHaveBeenCalledWith('/admin/users/1', updateData);
            expect(result).toEqual(mockUser);
        });
    });

    describe('deleteUser', () => {
        it('deletes user successfully', async () => {
            const mockResponse = { message: 'User deleted' };
            (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

            const result = await adminService.deleteUser(1);

            expect(apiService.delete).toHaveBeenCalledWith('/admin/users/1');
            expect(result).toEqual(mockResponse);
        });
    });
});
