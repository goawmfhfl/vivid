# Apple 로그인 (OAuth) 체크리스트 — Expo Go / 웹

[Supabase: Login with Apple](https://supabase.com/docs/guides/auth/social-login/auth-apple) 문서 기준으로, **Expo Go에서 웹 OAuth 플로우**가 실패할 때 확인할 항목입니다.

---

## 1. Apple Developer — Services ID (가장 자주 문제되는 부분)

**위치:** [Identifiers → Services ID](https://developer.apple.com/account/resources/identifiers/list/serviceId) → 해당 Services ID 선택 → **Configure** (Sign in with Apple)

| 항목 | 반드시 이렇게 |
|------|----------------|
| **Domains and Subdomains** | `mogjqlhzxqjuvffdizlc.supabase.co` (Supabase 프로젝트 도메인만, `https://` 없음) |
| **Return URLs** | `https://mogjqlhzxqjuvffdizlc.supabase.co/auth/v1/callback` (끝에 `/` 없음, 프로젝트 ID 일치) |

- 우리 앱 URL(`vividlog.app`, `192.168.0.5`)을 여기 넣으면 **안 됩니다**.  
  애플이 **Supabase**로 돌려보내야 하므로, **Supabase 도메인 + `/auth/v1/callback`** 만 넣어야 합니다.
- 오타(프로젝트 ID 한 글자라도 다름, `http` vs `https`)면 애플이 Supabase로 코드를 보내지 못해 "가입이 완료되지 않음"이 날 수 있습니다.

---

## 2. Apple Developer — 기타

- **App ID**: Capabilities에 **Sign in with Apple** 활성화.  
  “Server-to-Server notification” / “App Clip” 등은 Supabase 문서상 **비워 두기**.
- **Team ID**: 10자 영숫자. Supabase Apple 설정에 넣는 값과 동일한지 확인.
- **Services ID**: 위에서 설정한 그 ID를 Supabase Dashboard → Apple provider의 **Client ID**(Services ID)에 그대로 입력.

---

## 3. Supabase — Apple Provider

- **Client ID**: Apple Services ID 문자열 (예: `com.yourapp.web`).
- **Secret**: `.p8` 키로 생성한 **Client Secret**.  
  - [문서의 "Use this tool to generate"](https://supabase.com/docs/guides/auth/social-login/auth-apple) 툴 사용 (Safari 말고 Chrome/Firefox 권장).  
  - **6개월마다 재발급** 필요. 만료되면 로그인 실패합니다.
- **Team ID**, **Key ID** 등 문서에 나온 나머지 필드도 모두 채워져 있는지 확인.

---

## 4. Supabase — Redirect URLs (이미 설정하신 부분)

- 여기에는 **우리 앱**으로 돌아올 URL만 등록합니다.
- 예: `http://192.168.0.5:3000/auth/callback`, `https://vividlog.app/auth/callback`  
- **Supabase URL**(`https://...supabase.co/auth/v1/callback`)은 **이 목록에 넣지 않습니다**.

---

## 5. Expo Go에서의 동작

- 문서: *"When developing with Expo, you can test Sign in with Apple via the Expo Go app"*  
  → Expo Go에서 웹 OAuth로 테스트하는 건 지원 대상입니다.
- 다만 *"It is best practice to use native Sign in with Apple capabilities on those platforms instead"*  
  → 나중에 개발/프로덕션 빌드에서는 네이티브(Expo `expo-apple-authentication` 등) 사용이 권장됩니다.
- **다른 환경에서도 확인해 보는 것**을 추천:
  - **PC 브라우저**에서 `http://192.168.0.5:3000` 또는 `http://localhost:3000` 접속 후 애플 로그인  
    → 같은 Supabase/Apple 설정을 쓰므로, 여기서 성공하면 설정 문제 가능성이 낮아집니다.
  - **실기기 Safari**에서 `https://vividlog.app` (또는 스테이징 URL) 접속 후 애플 로그인  
    → WebView가 아닌 브라우저에서 콜백까지 도달하는지 확인할 수 있습니다.

---

## 6. "Providers에 등록되지 않고 로그인으로만 리다이렉션"될 때

**증상:** 애플 로그인 후 유저가 생성되지 않고, Supabase Auth의 identities에 Apple이 안 보이며, 우리 앱은 로그인 페이지로만 돌아감.

**원인:** Supabase가 **애플에서 받은 인증 코드를 세션으로 바꾸는 단계(code exchange)**에서 실패하고 있습니다. 이 단계가 성공해야만 Supabase에 유저와 `auth.identities`(provider: apple)가 생성됩니다. 실패하면 세션이 없으므로 우리 콜백이 로그인 페이지로 리다이렉트합니다.

**확인 순서:**

1. **Supabase Dashboard → Authentication → Providers → Apple**
   - **Apple이 활성화(Enabled)** 되어 있는지 확인.
   - **Client ID**: Apple **Services ID** (App ID `com.vivid.mobile`가 아님).
   - **Team ID**: 10자 (예: `TJKXD72963`).
   - **Key ID**: Apple Developer에서 만든 Sign in with Apple용 Key의 ID.
   - **Secret**: `.p8` 파일로 [Supabase 문서 툴](https://supabase.com/docs/guides/auth/social-login/auth-apple)에서 생성한 **Client Secret** (6개월마다 재발급). 비어 있거나 만료되면 코드 교환이 실패합니다.
   - 위 중 하나라도 비어 있거나 잘못되면 **유저/identities가 생성되지 않고** 로그인으로만 돌아갑니다.

2. **실제 에러 메시지 확인**
   - 로그인 페이지로 돌아갈 때 URL에 `?error=...` 가 붙어 있다면, 그 내용이 Supabase/애플 쪽 실패 사유입니다.
   - 또는 **Supabase Dashboard → Authentication → Logs**에서 해당 시도의 실패 로그를 확인하면 원인이 나옵니다.

3. **Apple Developer → Services ID**
   - Return URL이 `https://mogjqlhzxqjuvffdizlc.supabase.co/auth/v1/callback` 인지 다시 확인.  
   - 잘못되면 애플이 Supabase로 코드를 안 보내거나, Supabase가 교환에 실패할 수 있습니다.

---

## 7. 요약 — "가입이 완료되지 않음" / "로그인으로만 리다이렉션" 시 우선 확인

1. **Supabase → Providers → Apple**: **활성화** + Client ID(Services ID), Team ID, Key ID, **Secret** 전부 입력·유효한지.
2. **Apple Developer → Services ID**  
   Return URL이 **정확히**  
   `https://mogjqlhzxqjuvffdizlc.supabase.co/auth/v1/callback` 인지 확인.
3. **Supabase Apple Provider**의 Secret이 `.p8`로 **최근에 생성한 값**인지(6개월 미만), 툴로 다시 생성해 넣어보기.
4. **PC 터미널**에서 `npm run dev:host` 실행한 뒤, 애플 로그인 시도 → `[auth-debug ...]` 로그가 한 번이라도 찍히는지 확인.  
   - 전혀 안 찍히면: 애플 → Supabase 구간에서 실패(위 1, 2번).  
   - `callback_start` / `exchange_failed` 등이 찍히면: Supabase → 우리 앱 구간 또는 코드 교환 문제.
