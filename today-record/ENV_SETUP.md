# 환경 변수 설정 가이드

## 비밀번호 재설정 기능을 위한 환경 변수 설정

비밀번호 재설정 링크가 올바른 URL로 리다이렉트되도록 환경 변수를 설정해야 합니다.

### 환경 변수

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# 프로덕션 환경
NEXT_PUBLIC_NODE_ENV=production
NEXT_PUBLIC_BASE_URL=https://todayrecord.vercel.app

# 테스트 환경 (로컬 개발)
NEXT_PUBLIC_NODE_ENV=test
NEXT_PUBLIC_BASE_URL=http://localhost:3001

# 개발 환경
NEXT_PUBLIC_NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Vercel 배포 환경 변수 설정

1. Vercel 대시보드에 접속
2. 프로젝트 선택 → Settings → Environment Variables
3. 다음 변수 추가:
   - `NEXT_PUBLIC_NODE_ENV`: `production`
   - `NEXT_PUBLIC_BASE_URL`: `https://todayrecord.vercel.app`

### Supabase 설정

Supabase 대시보드에서도 리다이렉트 URL을 설정해야 합니다:

1. Supabase 대시보드 → Authentication → URL Configuration
2. Site URL: `https://todayrecord.vercel.app`
3. Redirect URLs에 추가:
   - `https://todayrecord.vercel.app/auth/reset-password`
   - `http://localhost:3001/auth/reset-password` (로컬 테스트용)

### 동작 방식

- **프로덕션**: `NEXT_PUBLIC_BASE_URL`이 설정되어 있으면 해당 URL 사용
- **테스트/개발**: `NEXT_PUBLIC_BASE_URL`이 설정되어 있으면 해당 URL 사용
- **기본값**: 환경 변수가 없으면 `window.location.origin` 사용

