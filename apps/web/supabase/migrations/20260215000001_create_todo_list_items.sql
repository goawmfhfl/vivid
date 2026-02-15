-- todo_list_items 테이블 생성
-- daily-vivid(비비드) 생성 시 Q1 기반 AI 투두 리스트 저장용

CREATE TABLE IF NOT EXISTS todo_list_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_vivid_id uuid NOT NULL REFERENCES daily_vivid(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contents text NOT NULL,
  is_checked boolean DEFAULT false,
  category text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_todo_list_items_daily_vivid ON todo_list_items(daily_vivid_id);
CREATE INDEX IF NOT EXISTS idx_todo_list_items_user ON todo_list_items(user_id);

COMMENT ON TABLE todo_list_items IS 'Pro 유저 daily-vivid 생성 시 Q1 기반 AI 투두 리스트';
COMMENT ON COLUMN todo_list_items.daily_vivid_id IS '연결된 daily_vivid id';
COMMENT ON COLUMN todo_list_items.category IS 'AI가 자동 분류한 카테고리 (예: 업무, 운동, 학습)';

-- RLS (Row Level Security) 정책 설정
ALTER TABLE todo_list_items ENABLE ROW LEVEL SECURITY;

-- 본인 todo만 조회 가능
CREATE POLICY "사용자는 본인 todo만 조회 가능"
  ON todo_list_items
  FOR SELECT
  USING (user_id = auth.uid());

-- 본인 todo만 수정 가능 (체크 토글)
CREATE POLICY "사용자는 본인 todo만 수정 가능"
  ON todo_list_items
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- INSERT는 서버(Service Role)에서만 수행
CREATE POLICY "서버에서 todo 삽입 가능"
  ON todo_list_items
  FOR INSERT
  WITH CHECK (true);
