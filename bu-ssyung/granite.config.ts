import { appsInToss } from '@apps-in-toss/framework/plugins';
import { defineConfig } from '@granite-js/react-native/config';
import { env } from '@granite-js/plugin-env';

export default defineConfig({
  scheme: 'intoss',
  appName: 'bussyung',
  plugins: [
    appsInToss({
      brand: {
        displayName: '버쓩',
        primaryColor: '#3182F6',
        icon: '',
      },
      permissions: [],
    }),
    env({
      PUBLIC_API_PRIVATE_KEY: process.env.PUBLIC_API_PRIVATE_KEY ?? '',
      API_STOP_ARRIVE_URL: process.env.API_STOP_ARRIVE_URL ?? '',
      API_BUS_ROUTE_URL: process.env.API_BUS_ROUTE_URL ?? '',
      API_BUS_LOCATION_URL: process.env.API_BUS_LOCATION_URL ?? '',
      API_STOP_URL: process.env.API_STOP_URL ?? ''
    }),
  ],
});