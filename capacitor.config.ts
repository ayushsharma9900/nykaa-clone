import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kaayalife.app',
  appName: 'KaayaLife',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  }
};

export default config;
