-- user_persona 테이블: 유저별 페르소나·트렌드·성장 인사이트 (JSONB)
CREATE TABLE IF NOT EXISTS user_persona (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  persona JSONB NOT NULL DEFAULT '{}',
  source_start DATE,
  source_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_persona_updated_at ON user_persona(updated_at);

ALTER TABLE user_persona ENABLE ROW LEVEL SECURITY;

-- 본인 또는 admin만 조회
CREATE POLICY "user_persona_select_own_or_admin"
  ON user_persona
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- INSERT/UPDATE는 서버(service role)만 (API 경유)
CREATE POLICY "user_persona_insert_service"
  ON user_persona
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "user_persona_update_service"
  ON user_persona
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
