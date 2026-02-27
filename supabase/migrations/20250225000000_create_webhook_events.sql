-- RevenueCat 웹훅 idempotency용 테이블
-- 동일 event_id 재처리 방지 (RevenueCat 재시도 대응)
CREATE TABLE IF NOT EXISTS webhook_events (
  event_id TEXT PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  event_type TEXT,
  app_user_id TEXT
);

-- 조회/관리용 인덱스
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed_at
  ON webhook_events (processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_events_app_user_id
  ON webhook_events (app_user_id);
