# 환경 변수 설정 가이드

## 필수 환경 변수

### 1. 암호화 키 설정 (필수)

Records 데이터 암호화를 위한 키를 설정해야 합니다.

#### 암호화 키 생성 방법

터미널에서 다음 명령어를 실행하여 32바이트(256비트) 암호화 키를 생성하세요:

```bash
# Node.js를 사용한 방법
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 OpenSSL을 사용한 방법
openssl rand -hex 32
```

생성된 키는 64자의 hex 문자열입니다 (예: `a1b2c3d4e5f6...`).

#### 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# 암호화 키 (64자 hex 문자열)
ENCRYPTION_KEY=your-64-character-hex-string-here
```

**중요**:

- 이 키는 절대 공개하지 마세요
- 프로덕션과 개발 환경에서 다른 키를 사용하는 것을 권장합니다
- 키를 분실하면 암호화된 데이터를 복호화할 수 없습니다

### 2. 비밀번호 재설정 기능을 위한 환경 변수

비밀번호 재설정 링크가 올바른 URL로 리다이렉트되도록 환경 변수를 설정해야 합니다.

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
   - `ENCRYPTION_KEY`: 생성한 64자 hex 문자열 (중요: 비공개로 설정)
   - `NEXT_PUBLIC_NODE_ENV`: `production`
   - `NEXT_PUBLIC_BASE_URL`: `https://todayrecord.vercel.app`

**주의**: `ENCRYPTION_KEY`는 **비공개(Secret)**로 설정해야 합니다. Vercel에서 환경 변수 추가 시 "Encrypted" 옵션을 활성화하세요.

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
