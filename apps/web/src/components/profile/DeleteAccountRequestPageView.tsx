"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Clock3, Database, Mail, Send, ShieldCheck, Smartphone } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { COLORS, CARD_STYLES, SPACING, TYPOGRAPHY, hexToRgba } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function DeleteAccountRequestPageView() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [consentChecked, setConsentChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function hydrateSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted || !session?.user) return;
      setIsAuthenticated(true);
      if (session.user.email) {
        setEmail(session.user.email);
      }
    }

    void hydrateSession();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getAuthHeaders = async (): Promise<Record<string, string>> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      return {};
    }

    return {
      Authorization: `Bearer ${session.access_token}`,
    };
  };

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return;
    }

    if (!validateEmail(email)) {
      setError("유효한 이메일 형식을 입력해주세요.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    if (!consentChecked) {
      setError("본인 계정 삭제 요청 확인에 동의해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const headers = await getAuthHeaders();
      const response = await fetch("/api/public/account-deletion-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          requestKind: "deletion",
          requesterEmail: email.trim(),
          title: title.trim(),
          content: content.trim(),
          images: [],
          consentChecked,
          requesterName: null,
          honeypot: "",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "요청 제출에 실패했습니다.");
      }

      setSuccessMessage("요청이 정상적으로 접수되었습니다. 확인 후 순차적으로 안내드립니다.");
      setTitle("");
      setContent("");
      setConsentChecked(false);
      router.push("/account-deletion-request/completed");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "요청 제출 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-20`}>
      <section
        className={cn(SPACING.card.padding, "rounded-2xl space-y-3")}
        style={{ ...CARD_STYLES.default }}
      >
        <h1 className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)} style={{ color: COLORS.text.primary }}>
          계정 삭제 요청
        </h1>
        <p className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)} style={{ color: COLORS.text.secondary }}>
          Google Play 등록용 계정 삭제 요청 페이지입니다.
        </p>
      </section>

      <section
        className={cn(SPACING.card.padding, "rounded-2xl mt-4 space-y-3")}
        style={{ ...CARD_STYLES.default }}
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className={cn(TYPOGRAPHY.h3.fontSize, TYPOGRAPHY.h3.fontWeight)} style={{ color: COLORS.text.primary }}>
            안내 정보
          </h2>
          <span
            className={cn(TYPOGRAPHY.caption.fontSize, "px-2 py-1 rounded-full")}
            style={{
              color: COLORS.brand.dark,
              backgroundColor: hexToRgba(COLORS.brand.light, 0.3),
            }}
          >
            Google Play 정책 반영
          </span>
        </div>
        <p
          className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.lineHeight)}
          style={{ color: COLORS.text.tertiary }}
        >
          아래 내용을 확인한 뒤 요청을 제출해주세요.
        </p>

        <div
          className="rounded-xl p-4"
          style={{
            backgroundColor: hexToRgba(COLORS.brand.light, 0.14),
            border: `1px solid ${hexToRgba(COLORS.brand.primary, 0.3)}`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: hexToRgba(COLORS.brand.primary, 0.2) }}
            >
              <ShieldCheck className="w-4 h-4" style={{ color: COLORS.brand.dark }} />
            </div>
            <div className="space-y-1">
              <p className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")} style={{ color: COLORS.text.primary }}>
                개발자 정보
              </p>
              <p className={cn(TYPOGRAPHY.bodySmall.fontSize)} style={{ color: COLORS.text.secondary }}>
                개발자: <span style={{ color: COLORS.text.primary }}>JAEYOUNG CHOI</span>
              </p>
              <p className={cn(TYPOGRAPHY.bodySmall.fontSize)} style={{ color: COLORS.text.secondary }}>
                앱: <span style={{ color: COLORS.text.primary }}>VIVID</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div
            className="rounded-xl p-4"
            style={{
              border: `1px solid ${COLORS.border.light}`,
              backgroundColor: COLORS.background.base,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="w-4 h-4" style={{ color: COLORS.brand.primary }} />
              <p className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")} style={{ color: COLORS.text.primary }}>
                앱에서 직접 탈퇴
              </p>
            </div>
            <p className={cn(TYPOGRAPHY.bodySmall.fontSize)} style={{ color: COLORS.text.secondary }}>
              [프로필] -&gt; [회원 탈퇴]
            </p>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              border: `1px solid ${COLORS.border.light}`,
              backgroundColor: COLORS.background.base,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Database className="w-4 h-4" style={{ color: COLORS.brand.primary }} />
              <p className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")} style={{ color: COLORS.text.primary }}>
                삭제 대상 데이터
              </p>
            </div>
            <p className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.lineHeight)} style={{ color: COLORS.text.secondary }}>
              계정 정보, 기록 데이터, 일/주/월 리포트, 연결된 계정 데이터
            </p>
          </div>

          <div
            className="rounded-xl p-4 sm:col-span-2"
            style={{
              border: `1px solid ${COLORS.border.light}`,
              backgroundColor: COLORS.background.base,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock3 className="w-4 h-4" style={{ color: COLORS.brand.primary }} />
              <p className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")} style={{ color: COLORS.text.primary }}>
                보관 데이터 및 기간
              </p>
            </div>
            <p className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.lineHeight)} style={{ color: COLORS.text.secondary }}>
              보안/오남용 방지 및 처리 이력 확인을 위한 최소 로그만 보관하며, 최대 30일 이내 파기됩니다.
            </p>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {error && (
          <div
            className="rounded-xl p-3 flex items-start gap-2"
            style={{
              backgroundColor: hexToRgba(COLORS.status.errorLight, 0.14),
              border: `1px solid ${hexToRgba(COLORS.status.error, 0.35)}`,
            }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5" style={{ color: COLORS.status.error }} />
            <p className={cn(TYPOGRAPHY.bodySmall.fontSize)} style={{ color: COLORS.status.errorDark }}>
              {error}
            </p>
          </div>
        )}

        {successMessage && (
          <div
            className="rounded-xl p-3 flex items-start gap-2"
            style={{
              backgroundColor: hexToRgba(COLORS.status.successLight, 0.15),
              border: `1px solid ${hexToRgba(COLORS.status.success, 0.35)}`,
            }}
          >
            <CheckCircle2 className="w-4 h-4 mt-0.5" style={{ color: COLORS.status.successDark }} />
            <p className={cn(TYPOGRAPHY.bodySmall.fontSize)} style={{ color: COLORS.status.successDark }}>
              {successMessage}
            </p>
          </div>
        )}

        <section className="rounded-2xl p-5 space-y-3" style={{ ...CARD_STYLES.default }}>
          <label className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")} style={{ color: COLORS.text.primary }}>
            이메일 (필수)
          </label>
          <div className="relative">
            <Mail
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: COLORS.text.tertiary }}
            />
            <input
              type="email"
              value={email}
              onChange={(e) => {
                if (!isAuthenticated) setEmail(e.target.value);
              }}
              readOnly={isAuthenticated}
              placeholder="삭제 요청을 처리할 이메일 주소를 입력해주세요"
              className="w-full rounded-lg pl-10 pr-4 py-3 border outline-none"
              style={{
                backgroundColor: isAuthenticated
                  ? COLORS.background.hoverLight
                  : COLORS.background.base,
                borderColor: COLORS.border.input,
                color: COLORS.text.primary,
              }}
            />
          </div>
          <p className={cn(TYPOGRAPHY.caption.fontSize)} style={{ color: COLORS.text.tertiary }}>
            {isAuthenticated
              ? "로그인된 계정 이메일로 자동 입력되었습니다."
              : "비로그인 제출 시 이메일 입력이 필수입니다."}
          </p>
        </section>

        <section className="rounded-2xl p-5 space-y-3" style={{ ...CARD_STYLES.default }}>
          <label className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")} style={{ color: COLORS.text.primary }}>
            제목
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="요청 제목을 입력해주세요"
            className="w-full rounded-lg px-4 py-3 border outline-none"
            style={{
              backgroundColor: COLORS.background.base,
              borderColor: COLORS.border.input,
              color: COLORS.text.primary,
            }}
          />

          <label className={cn(TYPOGRAPHY.body.fontSize, "font-semibold")} style={{ color: COLORS.text.primary }}>
            내용
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="삭제를 요청하는 계정 정보와 요청 내용을 작성해주세요."
            className="w-full rounded-lg px-4 py-3 border resize-none outline-none"
            style={{
              backgroundColor: COLORS.background.base,
              borderColor: COLORS.border.input,
              color: COLORS.text.primary,
            }}
          />
        </section>

        <section className="rounded-2xl p-5 space-y-3" style={{ ...CARD_STYLES.default }}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentChecked}
              onChange={(e) => setConsentChecked(e.target.checked)}
              className="mt-0.5"
            />
            <span className={cn(TYPOGRAPHY.bodySmall.fontSize, TYPOGRAPHY.bodySmall.lineHeight)} style={{ color: COLORS.text.secondary }}>
              본 요청은 본인 계정 삭제를 위한 요청이며, 허위 요청 시 처리가 제한될 수 있음에 동의합니다.
            </span>
          </label>
        </section>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 flex items-center justify-center gap-2"
          style={{
            backgroundColor: COLORS.brand.primary,
            color: COLORS.text.white,
          }}
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? "제출 중..." : "제출하기"}
        </Button>
      </form>
    </div>
  );
}
