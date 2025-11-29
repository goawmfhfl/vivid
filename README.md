# MyRecords - 모노레포

MyRecords는 일기 기록 및 AI 피드백 서비스입니다.

## 프로젝트 구조

```
myrecords/
├── apps/
│   ├── web/          # Next.js 웹 애플리케이션
│   └── mobile/        # Expo (React Native) 모바일 애플리케이션
├── packages/
│   └── core/          # 공통 타입, 유틸리티, 서비스 로직
└── package.json       # 루트 워크스페이스 설정
```

## 시작하기

### 사전 요구사항

- Node.js >= 18.0.0
- npm >= 9.0.0

### 설치

```bash
# 루트에서 모든 워크스페이스 의존성 설치
npm install
```

### 개발 서버 실행

```bash
# 웹 앱 실행
npm run dev:web

# 모바일 앱 실행 (Expo)
npm run dev:mobile
```

### 빌드

```bash
# 웹 앱 빌드
npm run build:web

# 모바일 앱 빌드
npm run build:mobile
```

## 워크스페이스

### apps/web

Next.js 15 기반 웹 애플리케이션

- **포트**: 기본 3000
- **환경 변수**: `.env.local` 파일에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정 필요

### apps/mobile

Expo (React Native) 기반 모바일 애플리케이션

- **환경 변수**: `.env` 파일에 `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` 설정 필요

### packages/core

웹과 모바일에서 공통으로 사용하는 패키지

- **타입 정의**: 도메인 타입 (Entry, DailyFeedback, WeeklyFeedback 등)
- **유틸리티**: 날짜 처리, 클래스명 병합 등
- **서비스**: Supabase 클라이언트 팩토리
- **상수**: API 엔드포인트, 쿼리 키 등

## 패키지 사용 예시

### 웹 앱에서 core 패키지 사용

```typescript
import { getKSTDateString, QUERY_KEYS } from "@myrecords/core";
import type { DailyFeedback } from "@myrecords/core";
```

### 모바일 앱에서 core 패키지 사용

```typescript
import { getKSTDateString } from "@myrecords/core";
import { createSupabaseClient } from "@myrecords/core";
```

## 기술 스택

- **웹**: Next.js 15, React 19, TypeScript
- **모바일**: Expo, React Native, TypeScript
- **백엔드**: Supabase
- **패키지 매니저**: npm (workspaces)
