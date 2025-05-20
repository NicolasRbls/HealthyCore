// frontend/jest.setup.js

// --- Mocks tiers (expo, router, etc.) ---

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve('test-token')),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
  Stack: {
    Screen: jest.fn(),
  },
  Redirect: jest.fn(() => null),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: jest.fn(({ children }) => children),
  SafeAreaView: jest.fn(({ children }) => children),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
}));

// Pour les tests d’API
global.fetch = jest.fn();

// --- Mock complet de react-native avec SettingsManager ---

// On récupère l'implémentation réelle pour y greffer notre SettingsManager
const realRN = jest.requireActual('react-native');

// Assurer l’existence de NativeModules.SettingsManager
realRN.NativeModules.SettingsManager = realRN.NativeModules.SettingsManager || { settings: {} };

jest.mock('react-native', () => {
  const RN = realRN;

  return {
    ...RN,

    // Mock des composants de base sans React
    TouchableOpacity: jest.fn(({ testID, onPress, children }) => ({
      type: 'TouchableOpacity',
      props: { testID, onPress },
      children,
    })),
    Text: jest.fn(({ testID, children }) => ({
      type: 'Text',
      props: { testID },
      children,
    })),
    View: jest.fn(({ testID, children }) => ({
      type: 'View',
      props: { testID },
      children,
    })),
    ActivityIndicator: jest.fn(({ size, color }) => ({
      type: 'ActivityIndicator',
      props: { size, color },
    })),

    // Style helper
    StyleSheet: {
      create: jest.fn(styles => styles),
    },

    Platform: {
      OS: 'ios',
      select: jest.fn(obj => obj.ios),
    },

    Alert: {
      alert: jest.fn(),
    },

    Dimensions: {
      get: jest.fn(dim => {
        if (dim === 'window' || dim === 'screen') {
          return { width: 375, height: 667 };
        }
        return { width: 0, height: 0 };
      }),
    },

    Animated: {
      View: jest.fn(({ children, style }) => ({
        type: 'Animated.View',
        props: { style },
        children,
      })),
      Text: jest.fn(({ children, style }) => ({
        type: 'Animated.Text',
        props: { style },
        children,
      })),
      Image: jest.fn(({ source, style }) => ({
        type: 'Animated.Image',
        props: { source, style },
      })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      Value: jest.fn(() => ({
        interpolate: jest.fn(),
        setValue: jest.fn(),
      })),
    },

    // On conserve NativeModules (contenant le SettingsManager)
    NativeModules: RN.NativeModules,
  };
});
