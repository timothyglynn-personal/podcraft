import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.podcraft.app',
  appName: 'PodCraft',
  webDir: 'out',
  // In production, the app loads from the Vercel deployment URL.
  // This means all API routes work because they're served by Vercel.
  // Comment out the server block below for local development with static export.
  server: {
    // Replace with your actual Vercel deployment URL
    url: 'https://podcraft.vercel.app',
    cleartext: false,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
    scheme: 'PodCraft',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a1628',
      showSpinner: false,
    },
  },
};

export default config;
