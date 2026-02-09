-- daily_vivid.trend → user_persona.persona.trend 마이그레이션
-- 암호화된 trend는 그대로 복사 (앱에서 복호화/재암호화 필요 시 스크립트 사용)

INSERT INTO user_persona (user_id, persona, updated_at)
SELECT dv.user_id,
       jsonb_build_object('trend', dv.trend),
       NOW()
FROM (
  SELECT user_id,
         trend,
         ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY report_date DESC) AS rn
  FROM daily_vivid
  WHERE trend IS NOT NULL
) dv
WHERE dv.rn = 1
ON CONFLICT (user_id) DO UPDATE SET
  persona = user_persona.persona || jsonb_build_object('trend', EXCLUDED.persona->'trend'),
  updated_at = NOW();
