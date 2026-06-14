import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/framework';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/theme';

const AD_GROUP_ID = 'ait.v2.live.e64e09ffed344652'; // ← 새로 발급받은 ID로 교체
const IS_DEV = __DEV__;

interface AdComponentProps {
  tickets: number;
  onReward: () => void;  // 광고 시청 완료 후 티켓 충전
  onClose: () => void;   // 배너 닫기
}

export const AdComponent = ({ tickets, onReward, onClose }: AdComponentProps) => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);

  useEffect(() => {
    if (IS_DEV) {
      setIsAdLoaded(true);
      return;
    }

    if (!loadFullScreenAd.isSupported()) {
      console.warn('광고 기능을 사용할 수 없습니다.');
      return;
    }

    const unregister = loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          setIsAdLoaded(true);
        }
      },
      onError: (error) => {
        console.error('광고 로드 실패:', error);
      },
    });

    return () => unregister();
  }, []);

  const handleShowAd = () => {
    if (IS_DEV) {
      onReward(); // 개발 환경에서는 바로 티켓 지급
      return;
    }

    showFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        switch (event.type) {
          case 'userEarnedReward':
            // ✅ 보상형: 끝까지 봤을 때만 티켓 지급
            onReward();
            break;
          case 'dismissed':
            setIsAdLoaded(false);
            // 다음 광고 미리 로드
            loadNextAd();
            break;
          case 'failedToShow':
            console.error('광고 표시 실패');
            break;
        }
      },
      onError: (error) => {
        console.error('광고 표시 실패:', error);
      },
    });
  };

  const loadNextAd = () => {
    loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded') setIsAdLoaded(true);
      },
      onError: (error) => console.error('광고 재로드 실패:', error),
    });
  };

  return (
    <View style={styles.banner}>
      <View style={styles.textArea}>
        <Text style={styles.title}>검색 횟수가 {tickets}회 남았어요</Text>
        <Text style={styles.sub}>광고를 보면 100회 충전돼요</Text>
      </View>
      <TouchableOpacity
        style={[styles.adButton, !isAdLoaded && styles.adButtonDisabled]}
        onPress={handleShowAd}
        disabled={!isAdLoaded}
        activeOpacity={0.8}
      >
        <Text style={[styles.adButtonText, !isAdLoaded && styles.adButtonTextDisabled]}>
          {isAdLoaded ? '충전하기' : '로딩 중...'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
  },
  textArea: { flex: 1 },
  title: { fontSize: Platform.OS === 'ios' ? 14 : 13, fontWeight: 'bold', color: COLORS.primaryDark },
  sub: { fontSize: Platform.OS === 'ios' ? 12 : 11, color: COLORS.text.sub, marginTop: 2 },
  adButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  adButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  adButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text.white,
  },
  adButtonTextDisabled: {
    color: COLORS.text.muted,
  },
  closeButton: { padding: 6, marginLeft: 4 },
  closeText: { fontSize: 14, color: COLORS.text.hint },
});