// src/hooks/ads/useFullScreenAd.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { loadFullScreenAd, showFullScreenAd } from '@apps-in-toss/framework';
import { Alert } from 'react-native';

const AD_GROUP_ID = 'ait.v2.live.bcccc1f2d86244b7';
const IS_DEV = __DEV__;

export const useFullScreenAd = () => {
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false); // 👈 클릭 후 광고를 기다리는 상태 추가
  const unregisterRef = useRef<(() => void) | null>(null);
  const successCallbackRef = useRef<(() => void) | null>(null);

  // 광고 보상 완료 콜백 실행
  const handleAdSuccess = useCallback(() => {
    if (successCallbackRef.current) {
      successCallbackRef.current();
      successCallbackRef.current = null;
    }
    setIsAdLoading(false);
  }, []);

  // 실제 광고 실행 함수
  const triggerShowAd = useCallback(() => {
    if (IS_DEV) {
      handleAdSuccess();
      return;
    }

    showFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        switch (event.type) {
          case 'userEarnedReward':
            handleAdSuccess();
            break;
          case 'dismissed':
            setIsAdLoaded(false);
            setIsAdLoading(false);
            preloadAd(); // 광고 닫히면 다음 광고 프리로드 시작
            break;
          case 'failedToShow':
            console.error('광고 표시 실패');
            Alert.alert('알림', '광고를 불러오는 중 오류가 발생했습니다.');
            setIsAdLoading(false);
            break;
        }
      },
      onError: (error) => {
        console.error('광고 표시 실패:', error);
        Alert.alert('알림', '광고를 재생할 수 없습니다.');
        setIsAdLoading(false);
      },
    });
  }, [handleAdSuccess]);

  // 광고 백그라운드 프리로드
  const preloadAd = useCallback(() => {
    if (IS_DEV) {
      setIsAdLoaded(true);
      return;
    }

    if (!loadFullScreenAd.isSupported()) {
      console.warn('광고 기능을 사용할 수 없습니다.');
      return;
    }

    if (unregisterRef.current) unregisterRef.current();

    const unregister = loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          setIsAdLoaded(true);
        }
      },
      onError: (error) => {
        console.error('광고 로드 실패:', error);
        setIsAdLoaded(false);
      },
    });

    unregisterRef.current = unregister;
  }, []);

  // 마운트 시 자동 로딩 시작
  useEffect(() => {
    preloadAd();
    return () => {
      if (unregisterRef.current) unregisterRef.current();
    };
  }, [preloadAd]);

  // 사용자가 "광고 보고 충전" 버튼을 눌렀을 때 실행될 메인 함수
  const showAd = useCallback((onSuccess: () => void) => {
    successCallbackRef.current = onSuccess;

    // 1. 이미 백그라운드 로드가 끝난 상태라면 즉시 광고 실행!
    if (isAdLoaded) {
      triggerShowAd();
      return;
    }

    // 2. 아직 로드가 안 되었다면 회색 버튼 상태("로딩 중...")로 변경 후 즉시 로딩 트리거
    setIsAdLoading(true);

    if (IS_DEV) {
      // 개발 모드에선 1.5초 딜레이 후 성공 처리 시뮬레이션
      setTimeout(() => {
        handleAdSuccess();
      }, 1500);
      return;
    }

    if (!loadFullScreenAd.isSupported()) {
      Alert.alert('알림', '이 기기에서는 광고 기능을 지원하지 않습니다.');
      setIsAdLoading(false);
      return;
    }

    if (unregisterRef.current) unregisterRef.current();

    // 광고 즉시 로드 시작
    const unregister = loadFullScreenAd({
      options: { adGroupId: AD_GROUP_ID },
      onEvent: (event) => {
        if (event.type === 'loaded') {
          setIsAdLoaded(true);
          // 로딩이 완료되는 그 즉시 자동으로 광고 실행!
          triggerShowAd();
        }
      },
      onError: (error) => {
        console.error('광고 불러오기 실패:', error);
        Alert.alert('알림', '광고를 불러오는 데 실패했습니다. 네트워크 상태를 확인해주세요.');
        setIsAdLoading(false);
        setIsAdLoaded(false);
      },
    });

    unregisterRef.current = unregister;
  }, [isAdLoaded, triggerShowAd, handleAdSuccess]);

  return {
    isAdLoaded,
    isAdLoading, // 👈 이 상태를 UI 컴포넌트에서 가져다 사용합니다.
    showAd,
  };
};