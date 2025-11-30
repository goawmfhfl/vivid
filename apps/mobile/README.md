# Today Journal Mobile

React Native 모바일 앱 (Expo 기반) - 웹뷰 방식

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 9 이상
- Expo CLI (전역 설치 권장): `npm install -g expo-cli`
- iOS 시뮬레이터 또는 Android 에뮬레이터 (또는 실제 디바이스)

### 설치

```bash
# 루트에서 의존성 설치
npm install

# 또는 모바일 앱만 설치
npm install --workspace=apps/mobile
```

### 환경 변수 설정

`.env.example`을 참고하여 `.env` 파일을 생성하고 Supabase 설정을 추가하세요:

```bash
cp .env.example .env
```

`.env` 파일에 다음을 설정:

- `EXPO_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
- `EXPO_PUBLIC_WEB_APP_URL`: 웹 앱 URL (개발/프로덕션)

### 웹 앱 URL 설정 가이드

#### iOS 시뮬레이터

```
EXPO_PUBLIC_WEB_APP_URL=http://localhost:3000
```

#### Android 에뮬레이터

```
EXPO_PUBLIC_WEB_APP_URL=http://10.0.2.2:3000
```

#### 실제 디바이스 (같은 네트워크)

1. 로컬 IP 주소 확인: `ifconfig` (Mac) 또는 `ipconfig` (Windows)
2. 웹 앱 개발 서버 실행: `npm run dev:web` (apps/web에서)
3. `.env`에 설정: `EXPO_PUBLIC_WEB_APP_URL=http://YOUR_LOCAL_IP:3000`
   예: `EXPO_PUBLIC_WEB_APP_URL=http://192.168.0.5:3000`

#### 프로덕션

```
EXPO_PUBLIC_WEB_APP_URL=https://your-production-url.com
```

### 개발 서버 실행

#### 1. 웹 앱 개발 서버 실행 (별도 터미널)

```bash
# apps/web에서 웹 앱 실행
cd apps/web
npm run dev
# 또는 루트에서
npm run dev:web
```

#### 2. 모바일 앱 실행

```bash
# 루트에서 실행
npm run dev:mobile

# 또는 직접 실행
cd apps/mobile
npm run dev
```

### 테스트 방법

#### iOS 시뮬레이터에서 테스트

1. 웹 앱 개발 서버 실행 (`npm run dev:web`)
2. 모바일 앱 실행: `npm run ios`
3. Expo 개발 메뉴에서 iOS 시뮬레이터 선택
4. 앱이 열리면 웹뷰에 웹 앱이 표시됩니다

#### Android 에뮬레이터에서 테스트

1. 웹 앱 개발 서버 실행 (`npm run dev:web`)
2. `.env`에서 `EXPO_PUBLIC_WEB_APP_URL=http://10.0.2.2:3000` 설정
3. 모바일 앱 실행: `npm run android`
4. Expo 개발 메뉴에서 Android 에뮬레이터 선택

#### 실제 디바이스에서 테스트

1. **같은 Wi-Fi 네트워크에 연결**
2. 로컬 IP 주소 확인
3. `.env`에 `EXPO_PUBLIC_WEB_APP_URL=http://YOUR_LOCAL_IP:3000` 설정
4. 웹 앱 개발 서버 실행 (`npm run dev:web`)
5. 모바일 앱 실행 후 Expo Go 앱으로 스캔하거나 빌드

### 빌드

```bash
# iOS와 Android 모두 빌드
npm run build:mobile

# iOS만 빌드
npm run build:ios

# Android만 빌드
npm run build:android
```

## 프로젝트 구조

```
apps/mobile/
├── App.tsx          # 메인 앱 컴포넌트 (WebView 포함)
├── lib/
│   └── supabase.ts  # Supabase 클라이언트 설정
├── app.json         # Expo 설정
├── babel.config.js  # Babel 설정
├── tsconfig.json    # TypeScript 설정
├── .env             # 환경 변수 (gitignore에 포함)
└── assets/          # 이미지, 폰트 등 리소스
```

## 주요 기능

- **웹뷰 기반**: React Native WebView를 사용하여 웹 앱을 모바일 앱으로 래핑
- **Supabase 통합**: AsyncStorage를 사용한 세션 관리
- **인증 상태 동기화**: Supabase 인증 상태를 WebView와 동기화

## 문제 해결

### 웹뷰가 로드되지 않는 경우

1. 웹 앱 개발 서버가 실행 중인지 확인
2. `.env`의 `EXPO_PUBLIC_WEB_APP_URL`이 올바른지 확인
3. iOS 시뮬레이터: `localhost` 사용
4. Android 에뮬레이터: `10.0.2.2` 사용
5. 실제 디바이스: 로컬 IP 주소 사용

### Supabase 인증 오류

1. `.env` 파일에 Supabase 환경 변수가 올바르게 설정되었는지 확인
2. Expo 앱을 재시작 (환경 변수 변경 시 필요)
