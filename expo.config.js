module.exports = {
  expo: {
    name: 'FitSphere',
    slug: 'fitsphere-expo-go',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: false,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFFFFF',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.fitsphere.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#000000',
      },
      package: 'com.fitsphere.app',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-asset', 'expo-notifications'],
    sdkVersion: '54.0.0',
    server: {
      port: 8081,
    },
  },
};
