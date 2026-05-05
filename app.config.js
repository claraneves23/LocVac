const IS_DEV = process.env.APP_VARIANT === "development";

module.exports = {
  expo: {
    name: IS_DEV ? "LocVac (Dev)" : "LocVac",
    slug: "LocVac",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/iconLocVac.png",
    userInterfaceStyle: "light",
    backgroundColor: "#CAE3E2",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSPhotoLibraryUsageDescription:
          "Permitir acesso a fotos para adicionar imagem do dependente.",
        NSCameraUsageDescription:
          "Permitir acesso a camera para adicionar imagem do dependente.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/iconLocVac.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      softwareKeyboardLayoutMode: "resize",
      package: IS_DEV ? "com.devvale.LocVac.dev" : "com.devvale.LocVac",
      permissions: ["CAMERA", "READ_MEDIA_IMAGES"],
    },
    androidNavigationBar: {
      backgroundColor: "#00000000",
      barStyle: "dark-content",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-font",
      "@react-native-community/datetimepicker",
      [
        "expo-notifications",
        {
          icon: "./assets/images/iconLocVac.png",
          color: "#29442d",
        },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: "85ea6c1a-4394-42e6-8b30-d3e1bb24d855",
      },
    },
  },
};
