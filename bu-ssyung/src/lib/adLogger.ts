// lib/adLogger.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getTossAppVersion } from '@apps-in-toss/framework';

const SUPABASE_URL = import.meta.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error('[adLogger] Supabase URL 또는 Anon Key가 설정되지 않았습니다.');
}

export type AdEventType =
  // 배너 광고 (InlineAd)
  | 'onAdRendered'
  | 'onAdImpression'
  | 'onAdViewable'
  | 'onAdClicked'
  | 'onNoFill'
  | 'onAdFailedToRender'
  | 'banner_mount_attempt'
  | 'banner_skipped_unsupported_version'
  // 보상형 광고 (FullScreenAd)
  | 'reward_modal_shown'
  | 'reward_ad_load_start'
  | 'reward_loaded'
  | 'reward_requested'
  | 'reward_show'
  | 'reward_impression'
  | 'reward_userEarnedReward'
  | 'reward_dismissed'
  | 'reward_load_error'
  | 'reward_show_error'
  | 'reward_closed_without_reward'
  | (string & {}); // 타입 추론 지원 및 커스텀 문자열 허용

export function logAdEvent(eventType: AdEventType, payload: any) {
  if (!supabase) {
    console.warn('[adLogger] Supabase client가 초기화되지 않아 로그를 전송하지 못했습니다.');
    return;
  }

  // 배너 SDK 및 보상형 SDK 객체별 필드 파싱
  const adGroupId =
    payload?.adGroupId ??
    payload?.ad_group_id ??
    payload?.options?.adGroupId ??
    null;

  const slotId = payload?.slotId ?? payload?.slot_id ?? null;

  const errorCode =
    payload?.error?.code ??
    payload?.code ??
    (typeof payload?.error === 'string' ? payload.error : null);

  const errorMessage =
    payload?.error?.message ??
    payload?.message ??
    null;

  const row = {
    event_type: eventType,
    slot_id: slotId,
    ad_group_id: adGroupId,
    toss_version: getTossAppVersion?.() ?? null,
    error_code: errorCode,
    error_message: errorMessage,
    payload: payload ?? {},
  };

  supabase
    .from('ad_events')
    .insert(row)
    .then(({ error }) => {
      if (error) console.warn('[adLogger] insert failed', error);
    });
}