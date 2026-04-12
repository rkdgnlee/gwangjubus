/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';
AppRegistry.registerComponent(appName, () => App);
notifee.onBackgroundEvent(async ({ type, detail }) => {
  // 백그라운드에서 알림 눌렀을 때 처리
  // 실제 화면 이동은 getInitialNotification이 담당하므로 여기선 비워도 됨
});