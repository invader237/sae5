module.exports = {
  expo: {
    name: "front",
    slug: "front",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.anonymous.front",
      infoPlist: {
        NSCameraUsageDescription:
          "Cette application utilise la caméra pour l'analyse en temps réel."
      }
    },

    android: {
      package: "com.anonymous.front",
      permissions: ["CAMERA"],
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },

    plugins: [
      "expo-router",
      "expo-web-browser",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ]
    ],

    experiments: {
      typedRoutes: true
    },

    extra: {
      backendApiAddress:
        process.env.EXPO_PUBLIC_BACKEND_API_ADDRESS ||
        "http://localhost:8000",
      eas: {
        projectId: "70317ab0-0903-4ae3-9a6a-31190fd7e353"
      }
    }
  }
};
