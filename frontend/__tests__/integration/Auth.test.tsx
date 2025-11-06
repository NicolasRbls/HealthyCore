// __tests__/integration/Auth.test.tsx
import React from 'react';

// 1. Mock les dépendances essentielles en PREMIER
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: { create: jest.fn(styles => styles) },
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  SafeAreaView: 'SafeAreaView',
  Alert: { alert: jest.fn() },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 667 })),
  },
}));

// 2. Mock Layout.ts directement pour éviter l'erreur
jest.mock('../../constants/Layout', () => ({
  window: { width: 375, height: 667 },
  isLandscape: false,
  safeArea: { top: 44, bottom: 34, horizontal: 16 },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  borderRadius: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, pill: 100 },
  iconSize: { xs: 16, sm: 20, md: 24, lg: 32, xl: 40 },
  elevation: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 } },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 } },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 } },
  },
  animation: { fast: 150, normal: 300, slow: 450 },
  breakpoints: { phone: 0, tablet: 768, desktop: 1024 },
}));

// 3. Mock les autres dépendances
jest.mock('../../constants/Colors', () => ({
  brandBlue: ['#92A3FD', '#9DCEFF'],
  secondary: ['#C58BF2', '#EEA4CE'],
  black: '#1D1617',
  white: '#FFFFFF',
  red: '#FF5252',
  green: '#4CAF50',
  gray: {
    dark: '#7B6F72',
    medium: '#ADA4A5',
    light: '#DDDADA',
    ultraLight: '#F7F8F8',
  },
  error: '#FF5252',
}));

jest.mock('../../constants/Fonts', () => ({
  TextStyles: {
    h1: {},
    h2: {},
    h3: {},
    h4: {},
    body: {},
    bodyLarge: {},
    bodySmall: {},
    caption: {},
    buttonText: {},
    label: {},
  }
}));

// 4. Mock le context et hooks
jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: jest.fn(() => Promise.resolve()),
    loading: false,
    error: null,
    clearError: jest.fn(),
  }),
}));

jest.mock('../../hooks/useForm', () => ({
  useForm: () => ({
    values: { email: '', password: '' },
    errors: {},
    touched: {},
    handleChange: jest.fn(),
    handleBlur: jest.fn(),
    handleSubmit: jest.fn(),
    globalError: null,
    setGlobalError: jest.fn(),
  }),
}));

// 5. Mock les composants UI
jest.mock('../../components/ui/Input', () => 'Input');
jest.mock('../../components/ui/Button', () => 'Button');
jest.mock('../../components/layout/Header', () => 'Header');

// 6. Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

// 7. Maintenant, importer le composant
const LoginScreen = require('../../app/auth/login').default;

// 8. Configurer le test le plus simple possible
describe('Login Screen', () => {
  it('can be imported', () => {
    expect(LoginScreen).toBeDefined();
  });
});