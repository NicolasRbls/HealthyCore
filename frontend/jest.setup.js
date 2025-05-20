// frontend/jest.setup.js

// Stub TurboModuleRegistry getEnforcing for SettingsManager
jest.mock(
  'react-native/Libraries/TurboModule/TurboModuleRegistry',
  () => ({
    getEnforcing: jest.fn((name) => {
      if (name === 'SettingsManager') {
        return { getConstants: () => ({ settings: {} }) };
      }
      return {};
    }),
  })
);

// Mock NativeSettingsManager and Settings.ios
jest.mock(
  'react-native/Libraries/Settings/NativeSettingsManager',
  () => ({
    getConstants: () => ({ settings: {} }),
  })
);
jest.mock(
  'react-native/Libraries/Settings/Settings.ios',
  () => ({ SettingsManager: { settings: {} } })
);

// --- Mocks d’Expo, router, etc. ---
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
  useSafeAreaInsets: jest.fn(() => ({ top:0,right:0,bottom:0,left:0 })),
}));

global.fetch = jest.fn();

// --- Mock global react-native, preserving native modules and stubbing missing ones ---
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  // Ensure SettingsManager stub
  RN.NativeModules = RN.NativeModules || {};
  RN.NativeModules.SettingsManager = RN.NativeModules.SettingsManager || { settings: {} };

  // Stub DeviceInfo module getConstants to satisfy NativeDeviceInfo import
  RN.NativeModules.DeviceInfo = RN.NativeModules.DeviceInfo || { getConstants: () => ({}) };

  return {
    ...RN,
    Alert: { alert: jest.fn() },
    TouchableOpacity: jest.fn(({ testID, onPress, children }) => ({ type:'TouchableOpacity', props:{testID,onPress}, children })),
    Text: jest.fn(({ testID, children }) => ({ type:'Text', props:{testID}, children })),
    View: jest.fn(({ testID, children }) => ({ type:'View', props:{testID}, children })),
    ActivityIndicator: jest.fn(({ size, color }) => ({ type:'ActivityIndicator', props:{size,color} })),
    StyleSheet: { create: jest.fn(styles => styles) },
    Platform: { OS:'ios', select: jest.fn(obj => obj.ios) },
    Dimensions: { get: jest.fn(dim => (dim==='window'||dim==='screen'?{width:375,height:667}:{width:0,height:0})) },
    Animated: {
      View: jest.fn(({ children, style }) => ({ type:'Animated.View', props:{style}, children })),
      Text: jest.fn(({ children, style }) => ({ type:'Animated.Text', props:{style}, children })),
      Image: jest.fn(({ source, style }) => ({ type:'Animated.Image', props:{source,style} })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      Value: jest.fn(() => ({ interpolate: jest.fn(), setValue: jest.fn() })),
    },
    NativeModules: RN.NativeModules,
  };
});