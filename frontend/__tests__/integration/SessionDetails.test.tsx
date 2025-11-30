import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SessionDetailsScreen from '../../app/user/sport/sessions/[id]';
import programsService from '../../services/programs.service';
import { router, useLocalSearchParams } from 'expo-router';

// Mocks
jest.mock('../../services/programs.service');
jest.mock('expo-router', () => ({
    router: {
        back: jest.fn(),
        push: jest.fn(),
    },
    useLocalSearchParams: jest.fn(),
}));
jest.mock('../../components/layout/Header', () => {
    const { Text } = require('react-native');
    return ({ title }: any) => <Text>{title}</Text>;
});
jest.mock('expo-image', () => ({
    Image: 'Image',
}));

describe('SessionDetailsScreen', () => {
    const mockSession = {
        id: 1,
        name: 'Test Session',
        description: 'A test session',
        level: 'Beginner',
        estimatedDuration: 30,
        tags: [{ id: 1, name: 'cardio' }],
        exercises: [
            {
                id: 1,
                name: 'Push ups',
                order: 1,
                sets: 3,
                repetitions: 10,
                duration: 0,
                description: 'Do push ups',
                equipment: 'None',
                gif: 'http://example.com/pushups.gif',
            },
            {
                id: 2,
                name: 'Plank',
                order: 2,
                sets: null,
                repetitions: null,
                duration: 60,
                description: 'Hold plank',
                equipment: 'None',
                gif: null,
            }
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
        (programsService.getSessionDetails as jest.Mock).mockResolvedValue(mockSession);
        // Mock alert
        jest.spyOn(window, 'alert').mockImplementation(() => { });
    });

    it('renders correctly and fetches session details', async () => {
        const { getByText } = render(<SessionDetailsScreen />);

        await waitFor(() => {
            expect(programsService.getSessionDetails).toHaveBeenCalledWith(1);
            expect(getByText('Test Session')).toBeTruthy();
            expect(getByText('Push ups')).toBeTruthy();
        });
    });

    it('expands exercise details on press', async () => {
        const { getByText } = render(<SessionDetailsScreen />);

        await waitFor(() => expect(getByText('Push ups')).toBeTruthy());

        fireEvent.press(getByText('Push ups'));

        await waitFor(() => {
            expect(getByText('Do push ups')).toBeTruthy();
            expect(getByText('Équipement nécessaire :')).toBeTruthy();
            expect(getByText('None')).toBeTruthy();
        });
    });

    it('formats exercise specs correctly', async () => {
        const { getByText } = render(<SessionDetailsScreen />);

        await waitFor(() => {
            expect(getByText('3 séries × 10 répétitions')).toBeTruthy();
            expect(getByText('60 minutes')).toBeTruthy();
        });
    });

    it('formats other exercise specs correctly', async () => {
        const otherSession = {
            ...mockSession,
            exercises: [
                {
                    id: 3,
                    name: 'Sets only',
                    order: 1,
                    sets: 3,
                    repetitions: null,
                    duration: 0,
                    description: '',
                    equipment: null,
                    gif: null,
                },
                {
                    id: 4,
                    name: 'Reps only',
                    order: 2,
                    sets: null,
                    repetitions: 15,
                    duration: 0,
                    description: '',
                    equipment: null,
                    gif: null,
                },
                {
                    id: 5,
                    name: 'Nothing',
                    order: 3,
                    sets: null,
                    repetitions: null,
                    duration: 0,
                    description: '',
                    equipment: null,
                    gif: null,
                }
            ]
        };
        (programsService.getSessionDetails as jest.Mock).mockResolvedValue(otherSession);
        const { getByText } = render(<SessionDetailsScreen />);

        await waitFor(() => {
            expect(getByText('3 séries')).toBeTruthy();
            expect(getByText('15 répétitions')).toBeTruthy();
            expect(getByText('Non spécifié')).toBeTruthy();
        });
    });

    it('handles fetch error and falls back to static data', async () => {
        (programsService.getSessionDetails as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        // We assume static data has session with id 1 named "Push (Pectoraux, triceps, épaules)"
        const { getByText } = render(<SessionDetailsScreen />);

        await waitFor(() => {
            // Check for static data content
            expect(getByText(/Push/)).toBeTruthy();
        });
    });

    it('handles session not found (API fail and static data fail)', async () => {
        (programsService.getSessionDetails as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '999999' }); // ID not in static data

        const { getByText } = render(<SessionDetailsScreen />);

        await waitFor(() => {
            expect(getByText('Séance non trouvée')).toBeTruthy();
        });
    });

});
