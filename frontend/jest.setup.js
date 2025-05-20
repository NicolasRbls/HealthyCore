// frontend/jest.setup.js

// 0) Stub NativeDeviceInfo
jest.mock(
  'react-native/src/private/specs/modules/NativeDeviceInfo',
  () => ({ getConstants: () => ({}) })
);

// 1) Stub Dimensions module BEFORE react-native loads it
jest.mock(
  'react-native/Libraries/Utilities/Dimensions',
  () => ({
    get: jest.fn(dim =>
      dim === 'window' || dim === 'screen'
        ? { width: 375, height: 667 }
        : { width: 0, height: 0 }
    ),
    set: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })
);

// 2) Stub TurboModuleRegistry for SettingsManager
jest.mock(
  'react-native/Libraries/TurboModule/TurboModuleRegistry',
  () => ({
    getEnforcing: jest.fn(name => {
      if (name === 'SettingsManager') {
        return { getConstants: () => ({ settings: {} }) };
      }
      return {};
    }),
  })
);

// 3) Mock NativeSettingsManager and Settings.ios
jest.mock(
  'react-native/Libraries/Settings/NativeSettingsManager',
  () => ({ getConstants: () => ({ settings: {} }) })
);
jest.mock(
  'react-native/Libraries/Settings/Settings.ios',
  () => ({ SettingsManager: { settings: {} } })
);

// --- Mocks for Expo and related ---
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve('test-token')),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ replace: jest.fn(), push: jest.fn(), back: jest.fn() })),
  usePathname: jest.fn(() => '/'),
  router: { replace: jest.fn(), push: jest.fn(), back: jest.fn() },
  Stack: { Screen: jest.fn() },
  Redirect: jest.fn(() => null),
}));

jest.mock('@expo/vector-icons', () => ({ Ionicons: 'Ionicons' }));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: jest.fn(({ children }) => children),
  SafeAreaView: jest.fn(({ children }) => children),
  useSafeAreaInsets: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
}));

global.fetch = jest.fn();

// --- Global mock for react-native ---
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Ensure NativeModules and SettingsManager stub
  RN.NativeModules = RN.NativeModules || {};
  RN.NativeModules.SettingsManager = RN.NativeModules.SettingsManager || { settings: {} };
  RN.NativeModules.NativeDeviceInfo = RN.NativeModules.NativeDeviceInfo || { getConstants: () => ({}) };

  return {
    ...RN,
    // re-export our stubbed Dimensions (jest.mock above took effect)
    // stub other components
    Alert: { alert: jest.fn() },
    TouchableOpacity: jest.fn(({ testID, onPress, children }) => ({ type: 'TouchableOpacity', props: { testID, onPress }, children })),
    Text: jest.fn(({ testID, children }) => ({ type: 'Text', props: { testID }, children })),
    View: jest.fn(({ testID, children }) => ({ type: 'View', props: { testID }, children })),
    ActivityIndicator: jest.fn(({ size, color }) => ({ type: 'ActivityIndicator', props: { size, color } })),
    StyleSheet: { create: jest.fn(styles => styles) },
    Platform: { OS: 'ios', select: jest.fn(obj => obj.ios) },
    Animated: {
      View: jest.fn(({ children, style }) => ({ type: 'Animated.View', props: { style }, children })),
      Text: jest.fn(({ children, style }) => ({ type: 'Animated.Text', props: { style }, children })),
      Image: jest.fn(({ source, style }) => ({ type: 'Animated.Image', props: { source, style } })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      Value: jest.fn(() => ({ interpolate: jest.fn(), setValue: jest.fn() })),
    },

    NativeModules: RN.NativeModules,
  };
});
