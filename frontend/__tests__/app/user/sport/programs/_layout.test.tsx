import React from 'react';
import { render } from '@testing-library/react-native';
import ProgramsLayout from '../../../../../app/user/sport/programs/_layout';
import { View } from 'react-native';

// Mocks
jest.mock('expo-router', () => {
    const React = require('react');
    const { View } = require('react-native');
    const Stack = ({ children }: { children: React.ReactNode }) => <View>{children}</View>;
    return {
        Stack,
    };
});

describe('ProgramsLayout', () => {
    it('renders stack', () => {
        const { toJSON } = render(<ProgramsLayout />);
        expect(toJSON()).toBeTruthy();
    });
});
