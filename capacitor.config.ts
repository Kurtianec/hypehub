import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hypehub.admin",
  appName: "HypeHub Admin",
  webDir: "public",
  server: {
    url: "https://hypehub.vercel.app/?admin=1&mobile_app=1",
    cleartext: false,
    androidScheme: "https",
    allowNavigation: ["hypehub.vercel.app"],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 900,
      backgroundColor: "#0a0a0a",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#0a0a0a",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
