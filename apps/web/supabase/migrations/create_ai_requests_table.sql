-- AI 사용량 추적 테이블 생성
CREATE TABLE IF NOT EXISTS ai_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model VARCHAR(50) NOT NULL, -- 'gpt-5-nano', 'gpt-5-mini', 'gpt-4-turbo' 등
  request_type VARCHAR(50) NOT NULL, -- 'daily_feedback', 'weekly_feedback', 'monthly_feedback'
  section_name VARCHAR(100), -- 'summary_report', 'daily_life_report', 'emotion_report' 등
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  cached_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER NOT NULL,
  cost_usd DECIMAL(10, 6) NOT NULL DEFAULT 0,
  cost_krw DECIMAL(12, 2) NOT NULL DEFAULT 0,
  duration_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_id ON ai_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created_at ON ai_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_requests_model ON ai_requests(model);
CREATE INDEX IF NOT EXISTS idx_ai_requests_request_type ON ai_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_ai_requests_user_created ON ai_requests(user_id, created_at);

-- RLS (Row Level Security) 정책 설정
ALTER TABLE ai_requests ENABLE ROW LEVEL SECURITY;

-- 관리자만 조회 가능하도록 정책 설정
CREATE POLICY "관리자는 모든 AI 요청 조회 가능"
  ON ai_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 서버 사이드에서만 삽입 가능 (API를 통해서만)
CREATE POLICY "서버 사이드에서만 AI 요청 삽입 가능"
  ON ai_requests
  FOR INSERT
  WITH CHECK (true);
