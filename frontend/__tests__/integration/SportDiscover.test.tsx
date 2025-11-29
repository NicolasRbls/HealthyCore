import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SportDiscoverScreen from '../../app/user/sport/sport-discover';
import programsService from '../../services/programs.service';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/programs.service');
jest.mock('expo-router', () => ({
    router: {
        push: jest.fn(),
    },
}));
jest.mock('../../components/layout/Header', () => {
    const { Text } = require('react-native');
    return ({ title }: any) => <Text>{title}</Text>;
});

describe('SportDiscoverScreen', () => {
    const mockPrograms = {
        programs: [
            {
                id: 1,
                name: 'Beginner Program',
                image: 'http://example.com/image.jpg',
                duration: 4,
                sessionCount: 12,
                tags: [{ id: 1, name: 'débutant' }],
                inProgress: false,
            },
            {
                id: 2,
                name: 'Intermediate Program',
                image: 'http://example.com/image2.jpg',
                duration: 8,
                sessionCount: 24,
                tags: [{ id: 2, name: 'intermédiaire' }],
                inProgress: false,
            },
        ],
        recommendedPrograms: [
            {
                id: 1,
                name: 'Beginner Program',
                image: 'http://example.com/image.jpg',
                duration: 4,
                sessionCount: 12,
                tags: [{ id: 1, name: 'débutant' }],
                inProgress: false,
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (programsService.getPrograms as jest.Mock).mockResolvedValue(mockPrograms);
    });

    it('renders correctly and fetches programs', async () => {
        const { getByText, getAllByText } = render(<SportDiscoverScreen />);

        await waitFor(() => {
            expect(programsService.getPrograms).toHaveBeenCalled();
            expect(getByText('Découvrir des programmes')).toBeTruthy();
            expect(getAllByText('Beginner Program').length).toBeGreaterThan(0);
            expect(getAllByText('Intermediate Program').length).toBeGreaterThan(0);
        });
    });

    it('navigates to program details on press', async () => {
        const { getAllByText } = render(<SportDiscoverScreen />);

        await waitFor(() => expect(getAllByText('Beginner Program').length).toBeGreaterThan(0));

        fireEvent.press(getAllByText('Beginner Program')[0]);

        expect(router.push).toHaveBeenCalledWith('/user/sport/programs/1');
    });

    it('handles fetch error', async () => {
        (programsService.getPrograms as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        const { getByText } = render(<SportDiscoverScreen />);

        await waitFor(() => {
            expect(getByText('Aucun programme recommandé')).toBeTruthy();
        });
    });
});
