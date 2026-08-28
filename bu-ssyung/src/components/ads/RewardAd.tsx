import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { loadFullScreenAd, showFullScreenAd, getTossAppVersion } from '@apps-in-toss/framework';
import { logAdEvent } from '../../lib/adLogger';

const REWARDED_AD_GROUP_ID = 'ait.v2.live.bcccc1f2d86244b7'; // 실제 리워드 광고 그룹 ID
const TEST_REWARDED_AD_GROUP_ID = 'ait-ad-test-rewarded-id';

interface RewardAdProps {
  tickets: number;
  onReward: () => void;
  onClose: () => void;
}

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

export const RewardAd = ({ tickets, onReward, onClose }: RewardAdProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const unregisterRef = useRef<(() => void) | null>(null);
  const rewardGrantedRef = useRef(false);

  const adGroupId = __DEV__ ? TEST_REWARDED_AD_GROUP_ID : REWARDED_AD_GROUP_ID;
  const tossVersion = getTossAppVersion();

  useEffect(() => {
    logAdEvent('reward_modal_shown', { currentTickets: tickets, adGroupId, tossVersion });

    return () => {
      // 언마운트 시 구독 등록 해제 (메모리 누수 방지)
      if (unregisterRef.current) {
        unregisterRef.current();
        unregisterRef.current = null;
      }
    };
  }, []);

  const handleStartAd = () => {
    // 1. 최소 지원 버전 체크
    if (!__DEV__ && !isVersionSupported(tossVersion, '5.138.0')) {
      logAdEvent('reward_skipped_unsupported_version', { tossVersion, adGroupId });
      Alert.alert('알림', '현재 토스 앱 버전에서는 보상형 광고를 지원하지 않습니다. 앱을 업데이트해 주세요.');
      return;
    }

    setIsLoading(true);
    rewardGrantedRef.current = false;
    logAdEvent('reward_ad_load_start', { adGroupId });

    // 기존 구독 해제
    if (unregisterRef.current) {
      unregisterRef.current();
    }

    // 2. 광고 로드
    unregisterRef.current = loadFullScreenAd({
      options: { adGroupId },
      onEvent: (event) => {
        logAdEvent(`reward_${event.type}`, { ...event, adGroupId });

        if (event.type === 'loaded') {
          // 3. 로드 완료 후 광고 표시 및 show 구독 함수로 갱신
          const unregisterShow = showFullScreenAd({
            options: { adGroupId },
            onEvent: (showEvent) => {
              logAdEvent(`reward_${showEvent.type}`, { ...showEvent, adGroupId });

              switch (showEvent.type) {
                case 'userEarnedReward':
                  rewardGrantedRef.current = true;
                  onReward();
                  break;

                case 'dismissed':
                  setIsLoading(false);
                  if (rewardGrantedRef.current) {
                    onClose(); // 보상을 정상 획득했을 때만 모달 닫기
                  }
                  break;

                case 'failedToShow':
                  // 3. 광고 표시 실패 시 멈춤 방지
                  setIsLoading(false);
                  Alert.alert('알림', '광고를 재생할 수 없습니다. 잠시 후 다시 시도해 주세요.');
                  break;

                default:
                  // requested, show, impression, clicked 등 단순 로그 기록용 이벤트
                  break;
              }
            },
            onError: (error) => {
              logAdEvent('reward_show_error', { error, adGroupId });
              handleAdError(error);
            },
          });

          // showFullScreenAd의 구독 해제 함수 보관
          unregisterRef.current = unregisterShow;
        }
      },
      onError: (error) => {
        logAdEvent('reward_load_error', { error, adGroupId });
        handleAdError(error);
      },
    });
  };

  const handleAdError = (error: any) => {
    setIsLoading(false);
    Alert.alert('알림', '광고를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  };

  const handleClose = () => {
    if (isLoading) return;
    logAdEvent('reward_closed_without_reward', { currentTickets: tickets, adGroupId });
    onClose();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>티켓이 모두 소모되었어요 🎫</Text>
          <Text style={styles.description}>
            광고를 시청하면 버스 도착 정보를 즉시 확인할 수 있는 티켓이 무료로 충전됩니다.
          </Text>

          <View style={styles.ticketBadge}>
            <Text style={styles.ticketText}>현재 보유 티켓: {tickets}개</Text>
          </View>

          {isLoading ? (
            <View style={styles.loadingArea}>
              <ActivityIndicator size="large" color="#31D698" />
              <Text style={styles.loadingText}>광고 불러오는 중...</Text>
            </View>
          ) : (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.rewardButton}
                onPress={handleStartAd}
                activeOpacity={0.8}
              >
                <Text style={styles.rewardButtonText}>🎬 광고 보고 무료 충전</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleClose}
                activeOpacity={0.7}
              >
                <Text style={styles.closeButtonText}>닫기</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191F28',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#4E5968',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  ticketBadge: {
    backgroundColor: '#F2F4F6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  ticketText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333D4B',
  },
  buttonContainer: {
    width: '100%',
    gap: 8,
  },
  rewardButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#31D698',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeButton: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#8B95A1',
    fontWeight: '500',
  },
  loadingArea: {
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: '#6B7684',
  },
});