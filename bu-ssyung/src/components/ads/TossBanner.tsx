import { getTossAppVersion, InlineAd } from '@apps-in-toss/framework';
import { Text } from '@toss/tds-react-native';
import { View } from 'react-native';
import React, { memo, useEffect } from 'react';
import { logAdEvent } from '../../lib/adLogger';

const AD_GROUP_ID = 'ait.v2.live.cb6d1265d76b4376';
const TEST_AD_GROUP_ID = 'ait-ad-test-banner-id';
const DEBUG_SHOW_REAL_AD = true;

function isVersionSupported(current: string, minVersion: string) {
  const c = current.split('.').map(Number);
  const m = minVersion.split('.').map(Number);
  for (let i = 0; i < Math.max(c.length, m.length); i++) {
    const cv = c[i] ?? 0;
    const mv = m[i] ?? 0;
    if (cv > mv) return true;
    if (cv < mv) return false;
  }
  return true;
}

function TossBannerComponent() {
  const adGroupId = __DEV__ ? TEST_AD_GROUP_ID : AD_GROUP_ID;
  const tossVersion = getTossAppVersion();

  // 👇 컴포넌트가 실제로 마운트/렌더 시도됐는지 무조건 기록 (SDK 콜백과 무관하게)
  useEffect(() => {
    logAdEvent('banner_mount_attempt', {
      adGroupId,
      tossVersion,
      isDev: __DEV__,
      timestamp: new Date().toISOString(),
    });
  }, []);

  if (__DEV__ && !DEBUG_SHOW_REAL_AD) {
    return (
      <View style={{ width: '100%', height: 96, backgroundColor: '#f2f4f6', justifyContent: 'center', alignItems: 'center' }}>
        <Text>📢 광고 영역 (실제 앱에서만 노출) {adGroupId}</Text>
      </View>
    );
  }

  if (!__DEV__ && !isVersionSupported(tossVersion, '5.241.0')) {
    logAdEvent('banner_skipped_unsupported_version', { tossVersion });
    console.log('[TossBanner] unsupported version, skip render', { tossVersion });
    return null;
  }

  return (
    <View style={{ width: '100%', height: 96, justifyContent: 'center' }}>
      <InlineAd
        adGroupId={adGroupId}
        impressFallbackOnMount={true}
        onAdRendered={(payload) => { console.log('[TossBanner] onAdRendered', payload); logAdEvent('onAdRendered', payload); }}
        onAdImpression={(payload) => { console.log('[TossBanner] onAdImpression', payload); logAdEvent('onAdImpression', payload); }}
        onAdViewable={(payload) => { console.log('[TossBanner] onAdViewable', payload); logAdEvent('onAdViewable', payload); }}
        onAdClicked={(payload) => { console.log('[TossBanner] onAdClicked', payload); logAdEvent('onAdClicked', payload); }}
        onNoFill={(payload) => { console.log('[TossBanner] onNoFill', payload); logAdEvent('onNoFill', payload); }}
        onAdFailedToRender={(payload) => { console.log('[TossBanner] onAdFailedToRender', payload); logAdEvent('onAdFailedToRender', payload); }}
      />
    </View>
  );
}

export const TossBanner = memo(TossBannerComponent);