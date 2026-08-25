// adLogger.ts
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

type AdEventType =
  | 'onAdRendered'
  | 'onAdImpression'
  | 'onAdViewable'
  | 'onAdClicked'
  | 'onNoFill'
  | 'onAdFailedToRender';

export function logAdEvent(eventType: AdEventType, payload: any) {
  if (!supabase) {
    console.warn('[adLogger] Supabase client가 초기화되지 않아 로그를 전송하지 못했습니다.');
    return;
  }

  const row = {
    event_type: eventType,
    slot_id: payload?.slotId ?? null,
    ad_group_id: payload?.adGroupId ?? null,
    toss_version: getTossAppVersion?.() ?? null,
    error_code: payload?.error?.code ?? null,
    error_message: payload?.error?.message ?? null,
    payload,
  };

  supabase
    .from('ad_events')
    .insert(row)
    .then(({ error }) => {
      if (error) console.warn('[adLogger] insert failed', error);
    });
}