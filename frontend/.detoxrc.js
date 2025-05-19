// .detoxrc.js
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
    apps: {
    'ios.debug': {
        type: 'ios.app',
        binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/YourApp.app',
        build: 'expo prebuild --platform ios && xcodebuild -workspace ios/YourApp.xcworkspace -scheme YourApp -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
        type: 'android.apk',
        binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
        build: 'expo prebuild --platform android && cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug',
    },
    // ... autres configurations
    },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 14',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Medium_Phone_API_36',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    'ios.sim.release': {
      device: 'simulator',
      app: 'ios.release',
    },
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    'android.emu.release': {
      device: 'emulator',
      app: 'android.release',
    },
  },
};