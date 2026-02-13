-- daily_vivid 테이블에 재생성 여부 컬럼 추가
-- 1번만 재생성 가능 기능을 위한 마크

ALTER TABLE daily_vivid
ADD COLUMN IF NOT EXISTS is_regenerated boolean DEFAULT false;

COMMENT ON COLUMN daily_vivid.is_regenerated IS '재생성 여부. true이면 이미 1회 재생성 완료된 상태';
