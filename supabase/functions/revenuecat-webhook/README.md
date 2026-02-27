# RevenueCat Webhook Edge Function

RevenueCat 구독 이벤트를 수신하여 `auth.users.user_metadata.subscription`을 갱신합니다.

## 배포 전 체크리스트

1. **마이그레이션 적용**: `webhook_events` 테이블 생성
   ```bash
   supabase db push
   # 또는 프로덕션: Supabase 대시보드 SQL Editor에서 migrations/20250225000000_create_webhook_events.sql 실행
   ```

2. **시크릿 설정**:
   ```bash
   supabase secrets set REVENUECAT_WEBHOOK_AUTH="your-secret-token"
   ```
   - `your-secret-token`: RevenueCat 대시보드에 설정할 값과 동일해야 함 (예: 랜덤 UUID)

3. **배포**:
   ```bash
   supabase functions deploy revenuecat-webhook --no-verify-jwt
   ```
   - `verify_jwt`는 `config.toml`에서 이미 `false`로 설정됨

## RevenueCat 대시보드 설정

1. **Project > Integrations > Webhooks** 이동
2. **Webhook URL**: `https://<PROJECT_REF>.supabase.co/functions/v1/revenuecat-webhook`
3. **Authorization Header**: `Bearer <REVENUECAT_WEBHOOK_AUTH>` (위 시크릿과 동일 값)
4. **이벤트 선택**: `INITIAL_PURCHASE`, `RENEWAL`, `CANCELLATION`, `EXPIRATION`, `UNCANCELLATION`, `SUBSCRIPTION_EXTENDED`, `BILLING_ISSUE`

## 관리자 테스트 UI

웹 앱의 **관리자 > 테스트 > 구독 테스트** 탭에서 웹훅을 직접 전송할 수 있습니다.

**필수**: `apps/web/.env.local`에 `REVENUECAT_WEBHOOK_AUTH`를 추가하세요 (Supabase 시크릿과 동일한 값).

## 로컬 테스트

```bash
# Supabase 로컬 시작 후
supabase functions serve revenuecat-webhook --no-verify-jwt

# TEST 이벤트 전송 (RevenueCat 대시보드에서 Send Test)
curl -X POST http://localhost:54321/functions/v1/revenuecat-webhook \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{"type":"TEST","id":"test-123"}'
```
