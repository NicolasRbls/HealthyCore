// __tests__/test-utils.tsx
import React from 'react';
import { render } from '@testing-library/react-native';


// Mock React Native
jest.mock('react-native', () => {
  return {
    // Composants de base
    View: jest.fn(props => ({ type: 'View', props })),
    Text: jest.fn(props => ({ type: 'Text', props })),
    TouchableOpacity: jest.fn(props => ({ type: 'TouchableOpacity', props })),
    ScrollView: jest.fn(props => ({ type: 'ScrollView', props })),
    TextInput: jest.fn(props => ({ type: 'TextInput', props })),
    ActivityIndicator: jest.fn(props => ({ type: 'ActivityIndicator', props })),
    Image: jest.fn(props => ({ type: 'Image', props })),
    SafeAreaView: jest.fn(props => ({ type: 'SafeAreaView', props })),
    FlatList: jest.fn(props => ({ type: 'FlatList', props })),
    
    // Utilitaires et API
    StyleSheet: {
      create: jest.fn(styles => styles),
      flatten: jest.fn(styles => styles),
    },
    Alert: {
      alert: jest.fn(),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 667 })),
    },
    Platform: {
      OS: 'ios',
      select: jest.fn(obj => obj.ios || obj.default),
    },
    
    // Animated API
    Animated: {
      View: jest.fn(props => ({ type: 'Animated.View', props })),
      Text: jest.fn(props => ({ type: 'Animated.Text', props })),
      Image: jest.fn(props => ({ type: 'Animated.Image', props })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      Value: jest.fn(() => ({
        interpolate: jest.fn(() => ({ interpolate: jest.fn() })),
        setValue: jest.fn(),
      })),
    },
    
    // Les modules qui causent des problèmes - mock vide
    Settings: {},
    Keyboard: {
      dismiss: jest.fn(),
      addListener: jest.fn(() => ({ remove: jest.fn() })),
    },
    NativeModules: {},
    NativeEventEmitter: jest.fn(() => ({
      addListener: jest.fn(),
      removeListeners: jest.fn(),
    })),
  };
});

// Mock des modules Expo
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve('mock-token')),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  },
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/test-path'),
  Stack: jest.fn(() => ({
    Screen: jest.fn(),
  })),
  Redirect: jest.fn(() => null),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: jest.fn(() => ({ type: 'Ionicons', props: {} })),
}));

// Fonction de rendu personnalisée 
function customRender(ui: React.ReactElement, options = {}) {
  return render(ui, options);
}

// Réexporter
export * from '@testing-library/react-native';
export { customRender as render };

// À la fin de __tests__/test-utils.tsx

// Ajouter ce test factice pour éviter l'erreur
describe('Utilities for testing', () => {
  it('is a valid utility file', () => {
    expect(true).toBe(true);
  });
});