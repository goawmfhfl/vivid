-- announcements 테이블에 version 컬럼 추가
-- 신규 공지 생성 시 기본값 1.0.0, 수정 시 관리자가 버전 업데이트 가능
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS version text DEFAULT '1.0.0';

-- 기존 데이터에 기본 버전 설정
UPDATE announcements
SET version = '1.0.0'
WHERE version IS NULL;
