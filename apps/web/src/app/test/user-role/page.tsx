"use client";

import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "@/constants";
import {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  CARD_STYLES,
} from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Role = "user" | "admin";

export default function UserRoleTestPage() {
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { subscription, isPro, isLoading: subLoading } = useSubscription();
  const queryClient = useQueryClient();

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const currentRole = (currentUser?.user_metadata?.role as Role) || "user";

  const handleRoleUpdate = async (role: Role) => {
    if (!currentUser) {
      setUpdateMessage({
        type: "error",
        message: "사용자 정보를 불러올 수 없습니다.",
      });
      return;
    }

    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      // 기존 메타데이터 가져오기
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("사용자 정보를 가져올 수 없습니다.");
      }

      const currentMetadata = user.user_metadata || {};

      // role 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          ...currentMetadata,
          role,
        },
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      // 쿼리 캐시 업데이트
      const updatedUser = {
        id: user.id,
        email: user.email,
        user_metadata: {
          ...currentMetadata,
          role,
        },
      };

      queryClient.setQueryData([QUERY_KEYS.CURRENT_USER], updatedUser);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CURRENT_USER] });

      setUpdateMessage({
        type: "success",
        message: `역할이 "${role}"로 성공적으로 변경되었습니다.`,
      });

      // 메시지 자동 제거
      setTimeout(() => {
        setUpdateMessage(null);
      }, 3000);
    } catch (error) {
      console.error("역할 업데이트 실패:", error);
      setUpdateMessage({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "역할 업데이트 중 오류가 발생했습니다.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (userLoading || subLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
            style={{ borderColor: COLORS.brand.primary }}
          ></div>
          <p style={{ color: COLORS.text.secondary }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className={cn(SPACING.card.padding)}
          style={{
            ...CARD_STYLES.default,
            maxWidth: "600px",
          }}
        >
          <h2 className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}>
            로그인이 필요합니다
          </h2>
          <p style={{ color: COLORS.text.secondary, marginTop: "1rem" }}>
            이 페이지를 사용하려면 먼저 로그인해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(SPACING.page.paddingHorizontal, SPACING.page.paddingVertical)}
      style={{ backgroundColor: COLORS.background.base, minHeight: "100vh" }}
    >
      <div className="mx-auto" style={{ maxWidth: SPACING.page.maxWidth }}>
        <h1
          className={cn(
            TYPOGRAPHY.h1.fontSize,
            TYPOGRAPHY.h1.fontWeight,
            "mb-8"
          )}
        >
          User Role 테스트 페이지
        </h1>

        {/* 현재 사용자 정보 */}
        <div
          className={cn(SPACING.card.padding, "mb-6")}
          style={CARD_STYLES.default}
        >
          <h2
            className={cn(
              TYPOGRAPHY.h2.fontSize,
              TYPOGRAPHY.h2.fontWeight,
              "mb-4"
            )}
          >
            현재 사용자 정보
          </h2>
          <div className="space-y-2">
            <div>
              <span style={{ color: COLORS.text.tertiary }}>ID: </span>
              <span style={{ color: COLORS.text.primary }}>{currentUser.id}</span>
            </div>
            <div>
              <span style={{ color: COLORS.text.tertiary }}>Email: </span>
              <span style={{ color: COLORS.text.primary }}>
                {currentUser.email || "없음"}
              </span>
            </div>
            <div>
              <span style={{ color: COLORS.text.tertiary }}>현재 Role: </span>
              <span
                style={{
                  color:
                    currentRole === "admin"
                      ? COLORS.status.success
                      : COLORS.text.primary,
                  fontWeight: "bold",
                }}
              >
                {currentRole}
              </span>
            </div>
          </div>
        </div>

        {/* useSubscription 테스트 결과 */}
        <div
          className={cn(SPACING.card.padding, "mb-6")}
          style={CARD_STYLES.default}
        >
          <h2
            className={cn(
              TYPOGRAPHY.h2.fontSize,
              TYPOGRAPHY.h2.fontWeight,
              "mb-4"
            )}
          >
            useSubscription 훅 테스트 결과
          </h2>
          <div className="space-y-2">
            <div>
              <span style={{ color: COLORS.text.tertiary }}>isPro: </span>
              <span
                style={{
                  color: isPro ? COLORS.status.success : COLORS.text.primary,
                  fontWeight: "bold",
                }}
              >
                {isPro ? "true" : "false"}
              </span>
            </div>
            <div>
              <span style={{ color: COLORS.text.tertiary }}>Plan: </span>
              <span style={{ color: COLORS.text.primary }}>
                {subscription?.plan || "없음"}
              </span>
            </div>
            <div>
              <span style={{ color: COLORS.text.tertiary }}>Status: </span>
              <span style={{ color: COLORS.text.primary }}>
                {subscription?.status || "없음"}
              </span>
            </div>
            <div>
              <span style={{ color: COLORS.text.tertiary }}>
                Admin 체크 결과:{" "}
              </span>
              <span
                style={{
                  color:
                    currentUser?.user_metadata?.role === "admin"
                      ? COLORS.status.success
                      : COLORS.status.error,
                  fontWeight: "bold",
                }}
              >
                {currentUser?.user_metadata?.role === "admin"
                  ? "✅ Admin으로 인식됨"
                  : "❌ Admin이 아님"}
              </span>
            </div>
          </div>
        </div>

        {/* Role 변경 UI */}
        <div
          className={cn(SPACING.card.padding, "mb-6")}
          style={CARD_STYLES.default}
        >
          <h2
            className={cn(
              TYPOGRAPHY.h2.fontSize,
              TYPOGRAPHY.h2.fontWeight,
              "mb-4"
            )}
          >
            Role 변경
          </h2>
          <p
            className="mb-4"
            style={{ color: COLORS.text.secondary, fontSize: "0.875rem" }}
          >
            아래 버튼을 클릭하여 현재 사용자의 role을 변경할 수 있습니다.
          </p>

          <div className="flex flex-wrap gap-3 mb-4">
            {(["user", "admin"] as Role[]).map((role) => (
              <Button
                key={role}
                variant={currentRole === role ? "default" : "outline"}
                onClick={() => handleRoleUpdate(role)}
                disabled={isUpdating || currentRole === role}
                style={{
                  backgroundColor:
                    currentRole === role ? COLORS.brand.primary : undefined,
                }}
              >
                {role === "admin" && "👑 "}
                {role === "user" && "👤 "}
                {role.toUpperCase()}
                {currentRole === role && " (현재)"}
              </Button>
            ))}
          </div>

          {isUpdating && (
            <div className="flex items-center gap-2">
              <div
                className="animate-spin rounded-full h-4 w-4 border-b-2"
                style={{ borderColor: COLORS.brand.primary }}
              ></div>
              <span style={{ color: COLORS.text.secondary }}>
                역할을 업데이트하는 중...
              </span>
            </div>
          )}

          {updateMessage && (
            <div
              className={cn(
                "mt-4 p-3 rounded-lg",
                updateMessage.type === "success"
                  ? "bg-green-50"
                  : "bg-red-50"
              )}
              style={{
                color:
                  updateMessage.type === "success"
                    ? COLORS.status.success
                    : COLORS.status.error,
              }}
            >
              {updateMessage.message}
            </div>
          )}
        </div>

        {/* user_metadata 전체 정보 */}
        <div
          className={cn(SPACING.card.padding)}
          style={CARD_STYLES.default}
        >
          <h2
            className={cn(
              TYPOGRAPHY.h2.fontSize,
              TYPOGRAPHY.h2.fontWeight,
              "mb-4"
            )}
          >
            user_metadata 전체 정보
          </h2>
          <pre
            className="overflow-auto p-4 rounded-lg"
            style={{
              backgroundColor: COLORS.background.cardElevated,
              color: COLORS.text.primary,
              fontSize: "0.75rem",
              border: `1px solid ${COLORS.border.light}`,
            }}
          >
            {JSON.stringify(currentUser.user_metadata, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
