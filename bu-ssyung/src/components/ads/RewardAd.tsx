// components/ads/RewardAd.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';

interface RewardAdProps {
  tickets: number;
  onReward: () => void;
  onClose: () => void;
}

export const RewardAd = ({ tickets, onReward, onClose }: RewardAdProps) => {
  const [isLoading, setIsLoading] = useState(false);

  // 1. 광고 모달 노출 로그 (ad_impression)
  useEffect(() => {
    console.log('[Analytics] ad_impression', {
      adType: 'rewarded',
      currentTickets: tickets,
      timestamp: new Date().toISOString(),
    });
  }, [tickets]);

  // 2. 광고 시청 완료 및 보상 지급 (ad_reward_claimed)
  const handleCompleteAd = () => {
    setIsLoading(false);
    console.log('[Analytics] ad_reward_claimed', {
      adType: 'rewarded',
      rewardAmount: 30, // 지급 티켓 수
      prevTickets: tickets,
      timestamp: new Date().toISOString(),
    });
    
    onReward();
  };

  // 3. 광고 시청 시작 (ad_start)
  const handleStartAd = async () => {
    console.log('[Analytics] ad_start', {
      adType: 'rewarded',
      timestamp: new Date().toISOString(),
    });

    setIsLoading(true);

    try {
      // 💡 토스 광고 SDK 시청 로직 처리 구역
      // 예시: await TossAdSDK.showRewardedAd();
      
      // 임시 시뮬레이션 (2초 후 광고 완료)
      setTimeout(() => {
        handleCompleteAd();
      }, 2000);
    } catch (error: any) {
      handleAdError(error);
    }
  };

  // 4. 광고 로드/재생 실패 (ad_load_failed)
  const handleAdError = (error: any) => {
    setIsLoading(false);
    console.error('[Analytics] ad_load_failed', {
      adType: 'rewarded',
      errorCode: error?.code ?? 'UNKNOWN_ERROR',
      errorMessage: error?.message ?? '광고를 불러오지 못했습니다.',
      timestamp: new Date().toISOString(),
    });

    Alert.alert('알림', '광고를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
  };

  // 5. 중도 닫기 / 이탈 (ad_closed_without_reward)
  const handleClose = () => {
    if (isLoading) return; // 광고 시청 중 닫기 방지

    console.log('[Analytics] ad_closed_without_reward', {
      adType: 'rewarded',
      currentTickets: tickets,
      timestamp: new Date().toISOString(),
    });

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
              <Text style={styles.loadingText}>광고 준비 중...</Text>
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