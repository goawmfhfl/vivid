# Today Journal - Monorepo

모노레포 구조의 Today Journal 프로젝트

## 프로젝트 구조

```
.
├── apps/
│   ├── web/          # 웹 애플리케이션 (Next.js) - 현재 비어있음
│   └── mobile/       # 모바일 애플리케이션 (React Native/Expo)
├── packages/         # 공유 패키지 (향후 추가 예정)
└── today-record/     # 기존 웹 프로젝트 (향후 apps/web으로 마이그레이션 예정)
```

## 시작하기

### 전체 의존성 설치

```bash
npm install
```

### 웹 개발 서버 실행

```bash
npm run dev:web
```

### 모바일 개발 서버 실행

```bash
npm run dev:mobile
```

## 워크스페이스

이 프로젝트는 npm workspaces를 사용합니다.

- `apps/web`: Next.js 웹 애플리케이션
- `apps/mobile`: React Native 모바일 애플리케이션
- `packages/*`: 공유 패키지 (향후 추가)

## 주의사항

- `apps/web` 폴더는 현재 비어있습니다. 향후 `today-record` 폴더의 내용을 마이그레이션할 예정입니다.
- 모바일 앱은 Expo를 사용하여 개발됩니다.
