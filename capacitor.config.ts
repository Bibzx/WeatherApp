import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.weathertask.pro',
  appName: 'WeatherTask Pro',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
