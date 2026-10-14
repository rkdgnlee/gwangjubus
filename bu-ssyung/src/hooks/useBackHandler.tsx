// src/hooks/useBackHandler.tsx
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useBackEvent } from '@granite-js/react-native';

/**
 * 앱인토스 상단 내비게이션 바(및 Android 하드웨어) 뒤로가기를 앱 내부 화면 이동에 연결한다.
 * 화면 안에 별도 뒤로가기 버튼을 그리지 않는다 — 내비게이션 바와 중복되면 검수에서 반려된다.
 *
 * useBackEvent는 등록된 핸들러를 전부 호출하므로, 여기서 하나만 등록하고
 * 가장 나중에 등록된(가장 안쪽) 화면의 핸들러만 실행한다.
 * 처리할 것이 없으면 등록을 해제해 기본 동작(미니앱 닫기)으로 넘긴다.
 */
type HandlerRef = { current: () => void };

const InAppBackContext = createContext<((handler: HandlerRef) => () => void) | null>(null);

export const InAppBackProvider = ({
  children,
  fallback,
}: {
  children: ReactNode;
  // 하위 화면에 처리할 뒤로가기가 없을 때 실행. null이면 미니앱 기본 동작(닫기)
  fallback?: (() => void) | null;
}) => {
  const backEvent = useBackEvent();
  const stackRef = useRef<HandlerRef[]>([]);
  const [depth, setDepth] = useState(0);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  const push = useCallback((handler: HandlerRef) => {
    stackRef.current = [...stackRef.current, handler];
    setDepth(stackRef.current.length);
    return () => {
      stackRef.current = stackRef.current.filter((h) => h !== handler);
      setDepth(stackRef.current.length);
    };
  }, []);

  const enabled = depth > 0 || fallback != null;

  useEffect(() => {
    if (!enabled) return;
    const onBack = () => {
      const top = stackRef.current[stackRef.current.length - 1];
      if (top) top.current();
      else fallbackRef.current?.();
    };
    backEvent.addEventListener(onBack);
    return () => backEvent.removeEventListener(onBack);
  }, [backEvent, enabled]);

  const value = useMemo(() => push, [push]);
  return <InAppBackContext.Provider value={value}>{children}</InAppBackContext.Provider>;
};

/** enabled일 때 뒤로가기를 가로채 onBack을 실행한다 (InAppBackProvider 안에서 사용) */
export const useBackHandler = (enabled: boolean, onBack: () => void) => {
  const push = useContext(InAppBackContext);
  const handlerRef = useRef(onBack);
  handlerRef.current = onBack;

  useEffect(() => {
    if (!enabled || !push) return;
    return push(handlerRef);
  }, [enabled, push]);
};
