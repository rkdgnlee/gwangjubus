import { InlineAd } from '@apps-in-toss/framework';
import { Text } from '@toss/tds-react-native';
import { View, StyleSheet } from 'react-native';

const AD_GROUP_ID = 'ait.v2.live.cb6d1265d76b4376'; // ← 새로 발급받은 ID로 교체
const TEST_AD_GROUP_ID = 'ait-ad-test-banner-id'; // 테스트용

interface TossBannerProps {
  variant?: 'expanded' | 'card';
}

export function TossBanner({ variant = 'expanded' }: TossBannerProps) {
  const adGroupId = __DEV__ ? TEST_AD_GROUP_ID : AD_GROUP_ID;
  if (__DEV__) {
    return (
      <View style={styles.devBanner}>
        <Text style={styles.devText}>📢 광고 영역 (실제 앱에서만 노출)</Text>
      </View>
    );
  }
  return (
    <View style={styles.wrapper}>
      <InlineAd
        adGroupId={adGroupId}
        theme="auto"
        tone="blackAndWhite"
        variant={variant}
        impressFallbackOnMount={true} // IOScrollView 없을 때 fallback
        onAdRendered={(payload) => console.log('광고 렌더링 완료:', payload.slotId)}
        onAdImpression={(payload) => console.log('광고 노출됨:', payload.slotId)}
        onAdViewable={(payload) => console.log('광고 수익 발생:', payload.slotId)}
        onAdClicked={(payload) => console.log('광고 클릭됨:', payload.slotId)}
        onNoFill={(payload) => console.warn('표시할 광고 없음:', payload.slotId)}
        onAdFailedToRender={(payload) => console.error('광고 렌더링 실패:', payload.error.message)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    height: 96,
    overflow: 'hidden',
  },
  // 스타일 추가
  devBanner: {
    width: '100%',
    height: 96,
    backgroundColor: '#f2f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  devText: {
    fontSize: 13,
    color: '#b0b8c1',
  },
});