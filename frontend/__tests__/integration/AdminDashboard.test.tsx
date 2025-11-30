import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AdminDashboard from '../../app/admin/dashboard';
import { useAuth } from '../../context/AuthContext';

// Mocks
jest.mock('../../context/AuthContext');
jest.mock('../../components/layout/Header', () => 'Header');

describe('AdminDashboard', () => {
    const mockLogout = jest.fn();
    const mockUser = { firstName: 'Admin', role: 'admin' };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAuth as jest.Mock).mockReturnValue({
            user: mockUser,
            logout: mockLogout,
        });
    });

    it('renders correctly', () => {
        const { getByText } = render(<AdminDashboard />);

        expect(getByText('Bienvenue, Admin')).toBeTruthy();
        expect(getByText('Rôle : Administrateur')).toBeTruthy();
    });

    it('handles logout', async () => {
        const { getByText } = render(<AdminDashboard />);

        fireEvent.press(getByText('Se déconnecter'));

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        });
    });
});
