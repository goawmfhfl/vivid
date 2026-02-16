-- todo_list_items에 scheduled_at 컬럼 추가 (날짜 미루기 기능)
-- scheduled_at: 해당 날짜로 미룬 경우, 그 날짜(YYYY-MM-DD)

ALTER TABLE todo_list_items
ADD COLUMN IF NOT EXISTS scheduled_at date DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_todo_list_items_scheduled_at
  ON todo_list_items(user_id, scheduled_at)
  WHERE scheduled_at IS NOT NULL;

COMMENT ON COLUMN todo_list_items.scheduled_at IS '미룬 날짜. null이면 원래 날짜의 할 일';
