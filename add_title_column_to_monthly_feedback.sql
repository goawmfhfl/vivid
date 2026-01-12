-- monthly_feedback 테이블에 title 컬럼 추가
-- title은 암호화된 JSONB 데이터로 저장됩니다

ALTER TABLE monthly_feedback
ADD COLUMN title jsonb NULL;

-- 기존 데이터가 있는 경우, month_label을 기반으로 title을 설정할 수 있습니다 (선택사항)
-- UPDATE monthly_feedback
-- SET title = encrypt_jsonb_fields(month_label::jsonb)
-- WHERE title IS NULL AND month_label IS NOT NULL;

-- 인덱스 추가 (선택사항 - title로 검색이 필요한 경우)
-- CREATE INDEX idx_monthly_feedback_title ON monthly_feedback USING gin (title);

-- 코멘트 추가
COMMENT ON COLUMN monthly_feedback.title IS '월간 피드백 제목 (암호화된 JSONB, "~ 한 달" 형식)';
