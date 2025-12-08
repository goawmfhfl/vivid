"use client";

import { useState, useEffect } from "react";
import { COLORS, CARD_STYLES } from "@/lib/design-system";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function CreateProfileTestPage() {
  const [isLoading, setIsLoading] = useState(false);
  interface Profile {
    id: string;
    role: string;
    [key: string]: unknown;
  }

  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    profile?: Profile;
  } | null>(null);
  const [session, setSession] = useState<{
    access_token?: string;
    [key: string]: unknown;
  } | null>(null);

  useEffect(() => {
    // 현재 세션 가져오기
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 세션 변경 감지
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCreateProfile = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      // 세션이 없으면 에러
      if (!session?.access_token) {
        setResult({
          success: false,
          message: "로그인이 필요합니다. 먼저 로그인해주세요.",
        });
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/admin/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok && data.profile) {
        setResult({
          success: true,
          message: "관리자 프로필이 성공적으로 생성되었습니다!",
          profile: data.profile,
        });
      } else {
        setResult({
          success: false,
          message: data.error || "프로필 생성에 실패했습니다.",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "알 수 없는 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-8"
      style={{ backgroundColor: COLORS.background.primary }}
    >
      <div className="max-w-2xl mx-auto">
        <div
          className="rounded-xl p-6 sm:p-8 mb-6"
          style={{
            ...CARD_STYLES.default,
          }}
        >
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            관리자 프로필 생성 테스트
          </h1>
          <p style={{ color: COLORS.text.secondary }} className="mb-6">
            현재 로그인한 계정에 관리자 권한을 부여하는 프로필을 생성합니다.
            <br />
            <span className="text-xs" style={{ color: COLORS.text.tertiary }}>
              이미 프로필이 있는 경우 업데이트되지 않습니다.
            </span>
          </p>

          {!session && (
            <div
              className="mb-4 p-4 rounded-lg"
              style={{
                backgroundColor: COLORS.status.warning + "20",
                border: `1px solid ${COLORS.status.warning}`,
              }}
            >
              <p style={{ color: COLORS.status.warning }}>
                ⚠️ 로그인이 필요합니다. 먼저 로그인해주세요.
              </p>
            </div>
          )}

          {session && (
            <div
              className="mb-4 p-4 rounded-lg"
              style={{ backgroundColor: COLORS.background.hover }}
            >
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                로그인된 사용자: {session.user?.email || "알 수 없음"}
              </p>
            </div>
          )}

          <button
            onClick={handleCreateProfile}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            style={{
              backgroundColor: isLoading
                ? COLORS.background.hover
                : COLORS.brand.primary,
              color: COLORS.text.white,
            }}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                생성 중...
              </span>
            ) : (
              "관리자 프로필 생성하기"
            )}
          </button>
        </div>

        {result && (
          <div
            className="rounded-xl p-6 sm:p-8"
            style={{
              ...CARD_STYLES.default,
              backgroundColor: result.success
                ? COLORS.status.success + "10"
                : COLORS.status.error + "10",
              borderColor: result.success
                ? COLORS.status.success
                : COLORS.status.error,
            }}
          >
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle
                  className="w-6 h-6 flex-shrink-0 mt-0.5"
                  style={{ color: COLORS.status.success }}
                />
              ) : (
                <XCircle
                  className="w-6 h-6 flex-shrink-0 mt-0.5"
                  style={{ color: COLORS.status.error }}
                />
              )}
              <div className="flex-1">
                <h2
                  className="text-lg font-semibold mb-2"
                  style={{
                    color: result.success
                      ? COLORS.status.success
                      : COLORS.status.error,
                  }}
                >
                  {result.success ? "성공" : "실패"}
                </h2>
                <p
                  className="mb-4"
                  style={{
                    color: result.success
                      ? COLORS.text.primary
                      : COLORS.status.error,
                  }}
                >
                  {result.message}
                </p>

                {result.success && result.profile && (
                  <div
                    className="mt-4 p-4 rounded-lg"
                    style={{ backgroundColor: COLORS.background.hover }}
                  >
                    <h3
                      className="text-sm font-semibold mb-2"
                      style={{ color: COLORS.text.primary }}
                    >
                      생성된 프로필 정보:
                    </h3>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span style={{ color: COLORS.text.secondary }}>
                          ID:{" "}
                        </span>
                        <span style={{ color: COLORS.text.primary }}>
                          {result.profile.id}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: COLORS.text.secondary }}>
                          이메일:{" "}
                        </span>
                        <span style={{ color: COLORS.text.primary }}>
                          {result.profile.email}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: COLORS.text.secondary }}>
                          이름:{" "}
                        </span>
                        <span style={{ color: COLORS.text.primary }}>
                          {result.profile.name}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: COLORS.text.secondary }}>
                          역할:{" "}
                        </span>
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{
                            backgroundColor: COLORS.brand.light,
                            color: COLORS.brand.primary,
                          }}
                        >
                          {result.profile.role}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {result.success && (
                  <div className="mt-6">
                    <a
                      href="/admin"
                      className="inline-block px-6 py-3 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: COLORS.brand.primary,
                        color: COLORS.text.white,
                      }}
                    >
                      관리자 페이지로 이동
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          className="rounded-xl p-4 mt-6"
          style={{
            ...CARD_STYLES.default,
            backgroundColor: COLORS.background.hover,
          }}
        >
          <h3
            className="text-sm font-semibold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            주의사항
          </h3>
          <ul
            className="text-sm space-y-1 list-disc list-inside"
            style={{ color: COLORS.text.secondary }}
          >
            <li>이 페이지는 개발/테스트 목적으로만 사용하세요.</li>
            <li>프로덕션 환경에서는 이 페이지를 제거하거나 보호하세요.</li>
            <li>이미 프로필이 있는 경우 새로 생성되지 않습니다.</li>
            <li>생성된 프로필은 자동으로 관리자 권한(admin)을 가집니다.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
