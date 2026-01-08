-- 기록 타입(recordTypes)을 user_metadata에서 제거하는 마이그레이션
-- 
-- 이 마이그레이션은 기존 사용자들의 user_metadata에서 recordTypes 필드를 제거합니다.
-- Supabase Auth의 user_metadata는 JSONB 형식으로 저장되므로,
-- PostgreSQL의 JSONB 연산자를 사용하여 필드를 제거합니다.
--
-- 주의: Supabase Auth의 user_metadata는 직접 수정이 제한될 수 있습니다.
-- 이 스크립트는 Supabase Dashboard의 SQL Editor에서 실행하거나,
-- Supabase CLI를 통해 실행할 수 있습니다.

-- 방법 1: Supabase Dashboard SQL Editor에서 실행
-- auth.users 테이블의 user_metadata에서 recordTypes 필드 제거
-- 
-- 주의: 이 쿼리는 Supabase의 보안 정책에 따라 실행이 제한될 수 있습니다.
-- 대신 Supabase Admin API를 사용하거나, 각 사용자에 대해 updateUser를 호출하는 것이 안전합니다.

-- 방법 2: Supabase Admin API를 사용하는 방법 (권장)
-- 이 방법은 애플리케이션 코드에서 실행하거나 별도의 관리 스크립트로 실행합니다.
-- 
-- 예시 코드 (TypeScript):
-- ```
-- import { createClient } from '@supabase/supabase-js'
-- 
-- const supabaseAdmin = createClient(
--   process.env.SUPABASE_URL!,
--   process.env.SUPABASE_SERVICE_ROLE_KEY!
-- )
-- 
-- // 모든 사용자 조회
-- const { data: users } = await supabaseAdmin.auth.admin.listUsers()
-- 
-- // 각 사용자의 user_metadata에서 recordTypes 제거
-- for (const user of users.users) {
--   if (user.user_metadata?.recordTypes) {
--     const { recordTypes, ...restMetadata } = user.user_metadata
--     await supabaseAdmin.auth.admin.updateUserById(user.id, {
--       user_metadata: restMetadata
--     })
--   }
-- }
-- ```

-- 방법 3: PostgreSQL 함수를 사용한 직접 업데이트 (고급 사용자용)
-- 이 방법은 Supabase의 보안 정책을 우회할 수 있지만, 주의가 필요합니다.
-- 
-- 함수 생성
CREATE OR REPLACE FUNCTION remove_record_types_from_metadata()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  updated_metadata JSONB;
BEGIN
  -- auth.users 테이블의 모든 사용자에 대해 반복
  FOR user_record IN 
    SELECT id, raw_user_meta_data
    FROM auth.users
    WHERE raw_user_meta_data ? 'recordTypes'
  LOOP
    -- recordTypes 필드를 제거한 새로운 metadata 생성
    updated_metadata := user_record.raw_user_meta_data - 'recordTypes';
    
    -- user_metadata 업데이트
    UPDATE auth.users
    SET raw_user_meta_data = updated_metadata
    WHERE id = user_record.id;
  END LOOP;
END;
$$;

-- 함수 실행
SELECT remove_record_types_from_metadata();

-- 함수 삭제 (선택사항)
-- DROP FUNCTION IF EXISTS remove_record_types_from_metadata();

-- 참고:
-- 1. 이 마이그레이션은 기존 데이터를 수정합니다. 백업을 권장합니다.
-- 2. Supabase의 보안 정책에 따라 직접 auth.users 테이블 수정이 제한될 수 있습니다.
-- 3. 가장 안전한 방법은 Supabase Admin API를 사용하는 것입니다.
-- 4. 프로덕션 환경에서는 먼저 스테이징 환경에서 테스트하세요.
