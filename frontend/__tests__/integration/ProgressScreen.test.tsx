import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProgressScreen from '../../app/user/profile/progress';
import userService from '../../services/user.service';
import { Alert } from 'react-native';
import { router } from 'expo-router';

// Mocks
jest.mock('../../services/user.service');
jest.mock('expo-router', () => {
    const React = require('react');
    const back = jest.fn();
    const router = { back };
    return {
        useRouter: jest.fn(() => router),
        router,
        useFocusEffect: jest.fn((callback) => React.useEffect(callback, [callback])),
    };
});
jest.mock('../../components/layout/Header', () => 'Header');
jest.mock('../../components/ui/DatePicker', () => 'DatePicker');
jest.mock('react-native-svg', () => {
    const { View } = require('react-native');
    return {
        __esModule: true,
        default: (props: any) => <View {...props} />,
        Path: (props: any) => <View {...props} />,
        Line: (props: any) => <View {...props} />,
        Circle: (props: any) => <View {...props} />,
        Text: (props: any) => <View {...props} />,
    };
});

describe('ProgressScreen', () => {
    const mockEvolutionData = {
        evolution: [
            { date: '2023-01-01', weight: 80, height: 180, bmi: 24.7 },
            { date: '2023-02-01', weight: 78, height: 180, bmi: 24.1 },
        ],
        statistics: {
            initialWeight: 80,
            currentWeight: 78,
            weightChange: -2,
            weightChangePercentage: -2.5,
            initialBmi: 24.7,
            currentBmi: 24.1,
        },
    };

    const mockProgressStats = {
        nutrition: {
            averageCalories: 2000,
            averageProteins: 150,
            goalCompletionRate: 80,
        },
        activity: {
            completedSessions: 10,
            sessionsPerWeek: 3,
            mostFrequentActivity: 'running',
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Alert, 'alert');
        (userService.getUserEvolution as jest.Mock).mockResolvedValue(mockEvolutionData);
        (userService.getProgressStats as jest.Mock).mockResolvedValue(mockProgressStats);
    });

    it('renders correctly and fetches evolution data', async () => {
        const { getByText } = render(<ProgressScreen />);

        await waitFor(() => {
            expect(userService.getUserEvolution).toHaveBeenCalled();
            expect(userService.getProgressStats).toHaveBeenCalled();
            expect(getByText('80.0 kg')).toBeTruthy(); // Initial weight
            expect(getByText('78.0 kg')).toBeTruthy(); // Current weight
            expect(getByText('-2.0 kg')).toBeTruthy(); // Weight change
        });
    });

    it('handles adding new evolution entry', async () => {
        const { getByText, getByPlaceholderText } = render(<ProgressScreen />);

        await waitFor(() => expect(getByText('Historique d\'évolution')).toBeTruthy());

        fireEvent.press(getByText('Ajouter'));

        const weightInput = getByPlaceholderText('Entrez votre poids');
        const heightInput = getByPlaceholderText('Entrez votre taille');

        fireEvent.changeText(weightInput, '77');
        fireEvent.changeText(heightInput, '180');

        fireEvent.press(getByText('Enregistrer'));

        await waitFor(() => {
            expect(userService.addEvolutionEntry).toHaveBeenCalledWith(expect.objectContaining({
                weight: 77,
                height: 180,
            }));
            expect(Alert.alert).toHaveBeenCalledWith('Succès', 'Évolution enregistrée avec succès');
        });
    });

    it('filters data by period', async () => {
        const { getByText } = render(<ProgressScreen />);

        await waitFor(() => expect(getByText('Tout')).toBeTruthy());

        await waitFor(() => expect(userService.getUserEvolution).toHaveBeenCalledTimes(1));

        fireEvent.press(getByText('Année'));

        await waitFor(() => {
            expect(userService.getUserEvolution).toHaveBeenCalledTimes(2); // Initial + Filter
        });
    });

    it('handles fetch error', async () => {
        (userService.getUserEvolution as jest.Mock).mockRejectedValue(new Error('Fetch failed'));
        render(<ProgressScreen />);

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Impossible de charger les données d\'évolution.');
        });
    });
});
