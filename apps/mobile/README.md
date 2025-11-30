# Today Journal Mobile

React Native 모바일 앱 (Expo 기반)

## 시작하기

### 필수 요구사항

- Node.js 18 이상
- npm 9 이상
- Expo CLI (전역 설치 권장): `npm install -g expo-cli`

### 설치

```bash
# 루트에서 의존성 설치
npm install

# 또는 모바일 앱만 설치
npm install --workspace=apps/mobile
```

### 개발 서버 실행

```bash
# 루트에서 실행
npm run dev:mobile

# 또는 직접 실행
cd apps/mobile
npm run dev
```

### 플랫폼별 실행

```bash
# iOS 시뮬레이터
npm run ios

# Android 에뮬레이터
npm run android

# 웹 브라우저
npm run web
```

## 프로젝트 구조

```
apps/mobile/
├── App.tsx          # 메인 앱 컴포넌트
├── app.json         # Expo 설정
├── babel.config.js  # Babel 설정
├── tsconfig.json    # TypeScript 설정
└── assets/          # 이미지, 폰트 등 리소스
```
