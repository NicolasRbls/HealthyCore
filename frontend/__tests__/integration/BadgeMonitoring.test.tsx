import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import BadgeMonitoring from '../../app/user/dashboard/badge-monitoring';
import userService from '../../services/user.service';
import { Alert } from 'react-native';

// Mocks
jest.mock('../../services/user.service');
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
    },
    useLocalSearchParams: jest.fn().mockReturnValue({ from: '' }),
}));
jest.mock('../../components/layout/Header', () => 'Header');

describe('BadgeMonitoring', () => {
    const mockBadges = {
        unlockedBadges: [
            { id: 1, name: 'First Steps', description: 'Walk 1km', dateObtained: '2023-01-01', image: '/assets/images/badges/1-premier-aliment.png' },
        ],
        lockedBadges: [
            { id: 2, name: 'Marathon', description: 'Run 42km', image: '/assets/images/badges/2-premiere-seance.png' },
        ],
    };

    const mockNewBadges = {
        newBadges: [
            { id: 3, name: 'New Badge', description: 'Wow', dateObtained: '2023-01-02', image: '/assets/images/badges/3-serie-un-jour.png' },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (userService.getUserBadges as jest.Mock).mockResolvedValue(mockBadges);
        (userService.checkNewBadges as jest.Mock).mockResolvedValue({ newBadges: [] });
    });

    it('renders correctly and fetches badges', async () => {
        const { getByText } = render(<BadgeMonitoring />);

        await waitFor(() => {
            expect(userService.getUserBadges).toHaveBeenCalled();
            expect(getByText('First Steps')).toBeTruthy();
            expect(getByText('Marathon')).toBeTruthy();
        });
    });

    it('shows alert for new badges', async () => {
        (userService.checkNewBadges as jest.Mock).mockResolvedValue(mockNewBadges);
        render(<BadgeMonitoring />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith(
                'Nouveaux badges débloqués !',
                expect.stringContaining('1 nouveau(x) badge(s)'),
                expect.any(Array)
            );
        });
    });
});
