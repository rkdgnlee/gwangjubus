import { InlineAd } from '@apps-in-toss/framework';
import { Text } from '@toss/tds-react-native';
import { View } from 'react-native';

const AD_GROUP_ID = 'ait.v2.live.cb6d1265d76b4376'; // ← 새로 발급받은 ID로 교체
const TEST_AD_GROUP_ID = 'ait-ad-test-banner-id'; // 테스트용


export function TossBanner() {
  const adGroupId = __DEV__ ? TEST_AD_GROUP_ID : AD_GROUP_ID;
  if (__DEV__) {
    return (
      <View style={{ width: '100%', height: 96, overflow: 'hidden', backgroundColor: '#f2f4f6', }}>
        <Text>📢 광고 영역 (실제 앱에서만 노출) {adGroupId}</Text>
      </View>
    );
  }
  return (
    <View style={{ width: '100%', height: 96, overflow: 'hidden' }}>
      <InlineAd adGroupId={AD_GROUP_ID} impressFallbackOnMount={true} />
    </View>
  );
}
