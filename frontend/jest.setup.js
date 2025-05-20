// frontend/jest.setup.js

// --- Mocks d’Expo, router, vector-icons, etc. ---

// 0) Mock de TurboModuleRegistry pour intercepter SettingsManager
jest.mock(
  'react-native/Libraries/TurboModule/TurboModuleRegistry',
  () => ({
    // toute requête getEnforcing('SettingsManager') renverra un module avec getConstants()
    getEnforcing: jest.fn((name) => {
      if (name === 'SettingsManager') {
        return { getConstants: () => ({ settings: {} }) };
      }
      // tu peux ajouter d’autres modules si besoin
      return {};
    }),
  })
);

// 1) Mock de NativeSettingsManager (au cas où)
/* 
   Certains chemins internes peuvent aussi importer ce module directement :
   react-native/Libraries/Settings/NativeSettingsManager
*/
jest.mock(
  'react-native/Libraries/Settings/NativeSettingsManager',
  () => ({
    getConstants: () => ({ settings: {} }),
  })
);

// 2) (Optionnel) mock de Settings.ios si tu en as
jest.mock(
  'react-native/Libraries/Settings/Settings.ios',
  () => ({
    SettingsManager: { settings: {} },
  })
);

// ... puis tout le reste de tes mocks existants


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
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  Stack: { Screen: jest.fn() },
  Redirect: jest.fn(() => null),
}));

// Mock @expo/vector-icons
jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

// Mock safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: jest.fn(({ children }) => children),
  SafeAreaView:    jest.fn(({ children }) => children),
  useSafeAreaInsets: jest.fn(() => ({ top:0,right:0,bottom:0,left:0 })),
}));

// Global fetch mock pour tes tests d’API
global.fetch = jest.fn();

// --- Mock complet de react-native, y compris SettingsManager ---

jest.mock('react-native', () => {
  // 1) On récupère l'implémentation réelle à l’intérieur de la factory
  const RN = jest.requireActual('react-native');

  // 2) On s’assure que NativeModules.SettingsManager existe
  RN.NativeModules = RN.NativeModules || {};
  RN.NativeModules.SettingsManager = RN.NativeModules.SettingsManager || { settings: {} };

  // 3) On retourne l’ensemble des exports, plus nos mocks de composants
  return {
    ...RN,

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
      timing:   jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      Value:    jest.fn(() => ({
        interpolate: jest.fn(),
        setValue: jest.fn(),
      })),
    },

    // On remet NativeModules à jour
    NativeModules: RN.NativeModules,
  };
});
