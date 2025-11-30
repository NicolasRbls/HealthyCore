import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProgramDetailsScreen from '../../app/user/sport/programs/[id]';
import programsService from '../../services/programs.service';
import { Alert } from 'react-native';
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

describe('ProgramDetailsScreen', () => {
    const mockProgram = {
        id: 1,
        name: 'Test Program',
        image: 'http://example.com/image.jpg',
        duration: 4,
        description: 'A test program',
        tags: [{ id: 1, name: 'test' }],
        sessions: [
            { id: 1, name: 'Session 1', order: 1, exerciseCount: 5, exercises: [] },
        ],
        inProgress: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '1' });
        (programsService.getProgramDetails as jest.Mock).mockResolvedValue(mockProgram);
        (programsService.getActiveUserProgram as jest.Mock).mockResolvedValue(null);
    });

    it('renders correctly and fetches program details', async () => {
        const { getByText } = render(<ProgramDetailsScreen />);

        await waitFor(() => {
            expect(programsService.getProgramDetails).toHaveBeenCalledWith(1);
            expect(getByText('Test Program')).toBeTruthy();
            expect(getByText('A test program')).toBeTruthy();
            expect(getByText('Session 1')).toBeTruthy();
        });
    });

    it('starts program successfully', async () => {
        const { getByText } = render(<ProgramDetailsScreen />);

        await waitFor(() => expect(getByText('Choisir ce programme')).toBeTruthy());

        fireEvent.press(getByText('Choisir ce programme'));

        await waitFor(() => {
            expect(programsService.startProgram).toHaveBeenCalledWith(1, expect.any(String));
            expect(Alert.alert).toHaveBeenCalledWith('Programme démarré', expect.stringContaining('Test Program'), expect.any(Array));
        });
    });

    it('shows error if another program is active', async () => {
        (programsService.getActiveUserProgram as jest.Mock).mockResolvedValue({ id: 2, name: 'Other Program' });
        const { getByText } = render(<ProgramDetailsScreen />);

        await waitFor(() => {
            expect(getByText('Vous suivez déjà un programme')).toBeTruthy();
            expect(getByText('Vous suivez déjà le programme "Other Program". Vous devez terminer ce programme avant d\'en commencer un nouveau.')).toBeTruthy();
        });
    });

    it('navigates to session details', async () => {
        const { getByText } = render(<ProgramDetailsScreen />);

        await waitFor(() => expect(getByText('Session 1')).toBeTruthy());

        fireEvent.press(getByText('Session 1'));

        expect(router.push).toHaveBeenCalledWith('/user/sport/sessions/1');
    });

    it('handles program in progress', async () => {
        const inProgressProgram = { ...mockProgram, inProgress: true };
        (programsService.getProgramDetails as jest.Mock).mockResolvedValue(inProgressProgram);
        const { getByText } = render(<ProgramDetailsScreen />);

        await waitFor(() => {
            expect(getByText('Programme en cours')).toBeTruthy();
            expect(getByText('Ce programme est déjà en cours. Vous pouvez suivre votre progression dans la section "Suivi sportif".')).toBeTruthy();
        });
    });

    it('handles fetch error and falls back to static data', async () => {
        (programsService.getProgramDetails as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        // We assume static data has program with id 1 named "PPL débutant 10"
        const { getByText } = render(<ProgramDetailsScreen />);

        await waitFor(() => {
            expect(getByText('PPL débutant 10')).toBeTruthy();
        });
    });

    it('handles program not found (API fail and static data fail)', async () => {
        (programsService.getProgramDetails as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        (useLocalSearchParams as jest.Mock).mockReturnValue({ id: '999999' }); // ID not in static data

        const { getByText } = render(<ProgramDetailsScreen />);

        await waitFor(() => {
            expect(getByText('Programme non trouvé')).toBeTruthy();
        });
    });

    it('handles start program error', async () => {
        (programsService.startProgram as jest.Mock).mockRejectedValue(new Error('Start failed'));
        const { getByText } = render(<ProgramDetailsScreen />);

        await waitFor(() => expect(getByText('Choisir ce programme')).toBeTruthy());

        fireEvent.press(getByText('Choisir ce programme'));

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de démarrer le programme pour le moment.');
        });
    });

    it('handles local image', async () => {
        const localProgram = { ...mockProgram, image: null }; // Should use placeholder or map
        (programsService.getProgramDetails as jest.Mock).mockResolvedValue(localProgram);

        const { getByText } = render(<ProgramDetailsScreen />);
        await waitFor(() => expect(getByText('Test Program')).toBeTruthy());
        // Verify no crash
    });
});
