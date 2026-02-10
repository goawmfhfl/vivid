"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { getLoginPath } from "@/lib/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { NameField } from "./forms/NameField";
import { EmailField } from "./forms/EmailField";
import { SubmitButton } from "./forms/SubmitButton";
import { AuthHeader } from "./forms/AuthHeader";
import { Checkbox } from "./ui/checkbox";
import { DeleteAccountDialog } from "./profile/DeleteAccountDialog";
import { COLORS } from "@/lib/design-system";
import {
  useKakaoIdentity,
  useLinkKakao,
} from "@/hooks/useKakaoLinking";
import {
  useAppleIdentity,
  useLinkApple,
} from "@/hooks/useAppleLinking";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";

type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const SectionCard = ({ title, description, children }: SectionCardProps) => (
  <section className="rounded-2xl border border-[#EFE9E3] bg-white/80 p-5 sm:p-6 shadow-sm backdrop-blur">
    <div className="mb-4 flex items-start justify-between">
      <div>
        <h3 className="text-base font-semibold text-[#333333]">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-[#6B7A6F]">{description}</p>
        )}
      </div>
    </div>
    <div className="space-y-5">{children}</div>
  </section>
);

export function ProfileSettingsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: currentUser } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: "",
    agreeMarketing: false,
  });
  const [errors, setErrors] = useState<{
    name?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const [_linkSuccess, setLinkSuccess] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hasEmailProvider, setHasEmailProvider] = useState<boolean>(true);

  // 이메일 로그인 유저 여부 (identities에 email provider 있으면 true)
  useEffect(() => {
    if (!currentUser?.id) return;
    supabase.auth.getSession().then(({ data }) => {
      const identities = data.session?.user?.identities ?? [];
      setHasEmailProvider(
        identities.some((i) => i.provider === "email")
      );
    });
  }, [currentUser?.id]);

  // 카카오 연동 상태 (연동 해제 기능 없음)
  const { data: kakaoIdentity, isLoading: isLoadingKakao } = useKakaoIdentity();
  const linkKakaoMutation = useLinkKakao();
  const isKakaoLinked = Boolean(kakaoIdentity);

  // 애플 연동 상태 (연동 해제 기능 없음)
  const { data: appleIdentity, isLoading: isLoadingApple } = useAppleIdentity();
  const linkAppleMutation = useLinkApple();
  const isAppleLinked = Boolean(appleIdentity);
  const socialLinkButtonStyle = {
    backgroundColor: COLORS.brand.primary,
    color: COLORS.text.white,
    border: `1px solid ${COLORS.brand.primary}`,
    boxShadow: `0 2px 8px ${COLORS.brand.primary}30`,
  };

  const { showToast } = useToast();

  // URL 파라미터에서 연동 성공/에러 메시지 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      
      // 연동 성공 메시지 (카카오/애플)
      const linkedProvider = params.get("linked");
      if (linkedProvider === "kakao") {
        setLinkSuccess(true);
        setLinkError(null);
        router.replace("/user", { scroll: false });
        showToast("카카오 계정이 성공적으로 연동되었습니다.", 4000);
        setTimeout(() => setLinkSuccess(false), 4000);
      } else if (linkedProvider === "apple") {
        setLinkSuccess(true);
        setLinkError(null);
        router.replace("/user", { scroll: false });
        showToast("Apple 계정이 성공적으로 연동되었습니다.", 4000);
        setTimeout(() => setLinkSuccess(false), 4000);
      }
      
      // 연동 에러 메시지 (카카오/애플 공통)
      if (params.get("error") === "social_already_linked" || params.get("error") === "kakao_already_linked") {
        const errorMessage =
          params.get("message") || "이미 사용 중인 계정입니다.";
        setLinkError(errorMessage);
        setLinkSuccess(false);
        // URL에서 파라미터 제거
        router.replace("/user", { scroll: false });
      }
    }
  }, [router, showToast]);

  useEffect(() => {
    if (currentUser?.user_metadata) {
      const metadata = currentUser.user_metadata;
      setFormData({
        name: (metadata.name as string) || "",
        agreeMarketing: Boolean(metadata.agreeMarketing),
      });
    }
  }, [currentUser]);

  const updateField = (field: keyof typeof formData, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요.";
    setErrors(newErrors);
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        name: formData.name.trim(),
        agreeMarketing: formData.agreeMarketing,
      });
      setSuccess(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setErrors({ general: message });
    }
  };

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <div className="mx-auto w-full max-w-2xl">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-sm font-medium text-[#6B7A6F] transition hover:text-[#4B5A4F]"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로가기
        </button>

        <AuthHeader
          title="프로필 설정"
          subtitle="회원가입과 동일한 형태로 정보를 관리할 수 있어요."
        />

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {errors.general && (
            <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] p-4 text-sm text-[#991B1B]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {errors.general}
              </div>
            </div>
          )}



          <SectionCard
            title="기본 프로필"
            description={
              hasEmailProvider
                ? "이름, 이메일은 계정 보호와 이메일 찾기에 활용돼요."
                : "VIVID에서 사용할 이름을 설정해주세요."
            }
          >
            {hasEmailProvider && (
              <div>
                <EmailField
                  value={currentUser?.email || ""}
                  onChange={() => {}}
                  placeholder="이메일"
                  disabled={true}
                />
              </div>
            )}

            <div>
              <NameField
                value={formData.name}
                onChange={(value) => {
                  updateField("name", value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="이름을 입력하세요"
                error={errors.name}
                disabled={updateProfileMutation.isPending}
              />
            </div>
          </SectionCard>

          <SectionCard
            title="소셜 로그인 연동"
            description="카카오·애플 계정을 연동하면 더 편리하게 로그인할 수 있어요."
          >
            <div className="space-y-3">
              {/* 카카오 연동 */}
              <div className="flex items-center justify-between rounded-2xl border border-[#F4F1EA] bg-[#FBFAF7] p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: "#FEE500" }}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M10 3C5.58172 3 2 5.89543 2 9.5C2 11.6484 3.23828 13.5391 5.17188 14.6953L4.30469 17.8359C4.25781 18.0078 4.42969 18.1641 4.59375 18.0781L8.35938 15.8203C8.89844 15.9141 9.44531 15.9766 10 15.9766C14.4183 15.9766 18 13.0811 18 9.47656C18 5.87201 14.4183 3 10 3Z"
                        fill="#000000"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#333333]">
                      카카오 계정
                    </p>
                    {(!isKakaoLinked || isLoadingKakao) && (
                      <p className="mt-0.5 text-xs text-[#6B7A6F]">
                        {isLoadingKakao ? "확인 중..." : "연동되지 않음"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isKakaoLinked ? (
                    <span
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        color: COLORS.text.tertiary,
                        backgroundColor: COLORS.background.hoverLight,
                      }}
                    >
                      연동됨
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await linkKakaoMutation.mutateAsync();
                        } catch (error) {
                          const message =
                            error instanceof Error
                              ? error.message
                              : "연동에 실패했습니다.";
                          setErrors({ general: message });
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={socialLinkButtonStyle}
                      disabled={linkKakaoMutation.isPending || isLoadingKakao}
                    >
                      {linkKakaoMutation.isPending ? "연동 중..." : "연동하기"}
                    </button>
                  )}
                </div>
              </div>

              {/* 애플 연동 */}
              <div className="flex items-center justify-between rounded-2xl border border-[#F4F1EA] bg-[#FBFAF7] p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: COLORS.text.primary }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill={COLORS.text.white}
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-1.2 2.33-2.71 4.66-4.45 6.88zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#333333]">
                      Apple 계정
                    </p>
                    {(!isAppleLinked || isLoadingApple) && (
                      <p className="mt-0.5 text-xs text-[#6B7A6F]">
                        {isLoadingApple ? "확인 중..." : "연동되지 않음"}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isAppleLinked ? (
                    <span
                      className="px-3 py-1.5 rounded-lg text-xs font-medium"
                      style={{
                        color: COLORS.text.tertiary,
                        backgroundColor: COLORS.background.hoverLight,
                      }}
                    >
                      연동됨
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await linkAppleMutation.mutateAsync();
                        } catch (error) {
                          const message =
                            error instanceof Error
                              ? error.message
                              : "연동에 실패했습니다.";
                          setErrors({ general: message });
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      style={socialLinkButtonStyle}
                      disabled={linkAppleMutation.isPending || isLoadingApple}
                    >
                      {linkAppleMutation.isPending ? "연동 중..." : "연동하기"}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 연동 에러 메시지 */}
            {linkError && (
              <div className="mt-3 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#991B1B]">
                <div className="flex items-center gap-2 font-medium">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{linkError}</span>
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="알림 및 마케팅 수신"
            description="새로운 기능과 인사이트를 가장 먼저 알려드려요."
          >
            <div className="flex items-start gap-3 rounded-2xl border border-[#F4F1EA] bg-[#FBFAF7] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow">
                <Bell className="h-4 w-4 text-[#6B7A6F]" />
              </div>
              <div className="flex-1 text-sm text-[#4E4B46]">
                <p className="font-medium text-[#333333]">
                  마케팅 정보 수신 동의
                </p>
                <p className="mt-1 text-xs text-[#6B7A6F]">
                  이메일로 서비스 꿀팁, 업데이트, 이벤트 소식을 보내드려요.
                  언제든지 철회할 수 있습니다.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="marketing"
                  checked={formData.agreeMarketing}
                  onCheckedChange={(checked) =>
                    updateField("agreeMarketing", checked === true)
                  }
                  className="h-5 w-5"
                  disabled={updateProfileMutation.isPending}
                />
                <ChevronRight className="h-4 w-4 text-[#C5C1B8]" />
              </div>
            </div>
          </SectionCard>

          {success && (
            <div className="rounded-2xl border border-[#A8BBA8] bg-[#F2F7F2] p-4 text-sm text-[#3F553F]">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="h-4 w-4 text-[#4C7660]" />
                프로필이 업데이트되었습니다.
              </div>
              <p className="mt-1 text-xs">
                저장된 내용은 다음 로그인부터 반영됩니다.
              </p>
            </div>
          )}

          <SubmitButton
            isLoading={updateProfileMutation.isPending}
            isValid={
              Boolean(formData.name?.trim()) && !updateProfileMutation.isPending
            }
            loadingText="저장 중..."
            defaultText="변경 사항 저장하기"
          />

          {/* 회원 탈퇴 버튼 */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="text-xs transition-colors hover:underline"
              style={{
                color: COLORS.text.muted,
              }}
            >
              회원 탈퇴
            </button>
          </div>
        </form>

        {/* 회원 탈퇴 확인 다이얼로그 */}
        <DeleteAccountDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={() => {
            // 탈퇴 성공 시 로그인 페이지로 리다이렉션 (Development/Production 모두)
            // 로딩 모달이 완료 메시지를 표시한 후 리다이렉션
            setTimeout(() => {
              router.push(getLoginPath(searchParams, { deleted: "true" }));
            }, 500);
          }}
        />
      </div>
    </div>
  );
}
