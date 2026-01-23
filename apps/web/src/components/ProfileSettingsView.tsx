"use client";

import { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Bell,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { NameField } from "./forms/NameField";
import { EmailField } from "./forms/EmailField";
import { PhoneField } from "./forms/PhoneField";
import { SubmitButton } from "./forms/SubmitButton";
import { AuthHeader } from "./forms/AuthHeader";
import { Input } from "./ui/Input";
import { Checkbox } from "./ui/checkbox";
import { PhoneVerificationModal } from "./profile/PhoneVerificationModal";
import { DeleteAccountDialog } from "./profile/DeleteAccountDialog";
import { COLORS } from "@/lib/design-system";
import {
  useKakaoIdentity,
  useLinkKakao,
  useUnlinkKakao,
} from "@/hooks/useKakaoLinking";
import { useToast } from "@/hooks/useToast";

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
  const { data: currentUser, isLoading } = useCurrentUser();
  const updateProfileMutation = useUpdateProfile();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    birthYear: "",
    gender: "",
    agreeMarketing: false,
  });
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    birthYear?: string;
    gender?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const [isPhoneEditOpen, setIsPhoneEditOpen] = useState(false);
  const [_linkSuccess, setLinkSuccess] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // 카카오 연동 상태
  const { data: kakaoIdentity, isLoading: isLoadingKakao } = useKakaoIdentity();
  const linkKakaoMutation = useLinkKakao();
  const unlinkKakaoMutation = useUnlinkKakao();
  const isKakaoLinked = Boolean(kakaoIdentity);
  const { showToast } = useToast();

  // URL 파라미터에서 연동 성공/에러 메시지 확인
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      
      // 연동 성공 메시지
      if (params.get("linked") === "kakao") {
        setLinkSuccess(true);
        setLinkError(null);
        // URL에서 파라미터 제거
        router.replace("/user", { scroll: false });
        // Toast 팝업으로 성공 메시지 표시
        showToast("카카오 계정이 성공적으로 연동되었습니다.", 4000);
        // 3초 후 상태 초기화
        setTimeout(() => setLinkSuccess(false), 4000);
      }
      
      // 연동 에러 메시지
      if (params.get("error") === "kakao_already_linked") {
        const errorMessage =
          params.get("message") ||
          "이 카카오 계정은 이미 다른 사용자에게 연결되어 있습니다.";
        setLinkError(errorMessage);
        setLinkSuccess(false);
        // URL에서 파라미터 제거
        router.replace("/user", { scroll: false });
        // 5초 후 메시지 자동 숨김
        setTimeout(() => setLinkError(null), 5000);
      }
    }
  }, [router, showToast]);

  useEffect(() => {
    if (currentUser?.user_metadata) {
      const metadata = currentUser.user_metadata;
      setFormData({
        name: (metadata.name as string) || "",
        phone: (metadata.phone as string) || "",
        birthYear: (metadata.birthYear as string) || "",
        gender: (metadata.gender as string) || "",
        agreeMarketing: Boolean(metadata.agreeMarketing),
      });
    }
  }, [currentUser]);

  const updateField = (field: keyof typeof formData, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const openPhoneEditModal = () => {
    setIsPhoneEditOpen(true);
  };

  const closePhoneEditModal = () => {
    setIsPhoneEditOpen(false);
  };


  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = "이름을 입력해주세요.";
    if (!formData.phone.trim()) {
      newErrors.phone = "전화번호를 입력해주세요.";
    } else {
      const phoneRegex = /^[0-9-]+$/;
      const cleaned = formData.phone.replace(/\s/g, "");
      if (!phoneRegex.test(cleaned) || cleaned.length < 10) {
        newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
      }
    }

    if (!formData.birthYear) {
      newErrors.birthYear = "출생년도를 입력해주세요.";
    } else {
      const year = Number(formData.birthYear);
      const currentYear = new Date().getFullYear();
      if (
        isNaN(year) ||
        formData.birthYear.length !== 4 ||
        year < 1900 ||
        year > currentYear
      ) {
        newErrors.birthYear = "올바른 출생년도(YYYY)를 입력해주세요.";
      }
    }

    if (!formData.gender) {
      newErrors.gender = "성별을 선택해주세요.";
    }

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
        phone: formData.phone.trim(),
        birthYear: formData.birthYear,
        gender: formData.gender,
        agreeMarketing: formData.agreeMarketing,
      });
      setSuccess(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setErrors({ general: message });
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 py-8"
        style={{ backgroundColor: "#FAFAF8" }}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
          <p className="text-sm text-[#6B7A6F]">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ backgroundColor: "#FAFAF8" }}
    >
      <PhoneVerificationModal
        open={isPhoneEditOpen}
        onClose={closePhoneEditModal}
        onApply={async (phone) => {
          try {
            await updateProfileMutation.mutateAsync({
              phone: phone.trim(),
            });
            updateField("phone", phone);
            setIsPhoneEditOpen(false);
            setSuccess(true);
          } catch (error) {
            const message =
              error instanceof Error
                ? error.message
                : "전화번호 업데이트에 실패했습니다.";
            setErrors({ general: message });
          }
        }}
      />
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
            description="이름, 이메일, 연락처는 계정 보호와 이메일 찾기에 활용돼요."
          >
            <div>
              <EmailField
                value={currentUser?.email || ""}
                onChange={() => {
                  // 이메일은 수정 불가
                }}
                placeholder="이메일"
                disabled={true}
              />
            </div>

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

            <div>
              <PhoneField
                value={formData.phone}
                onChange={(value) => {
                  updateField("phone", value);
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                error={errors.phone}
                disabled={Boolean(formData.phone) || updateProfileMutation.isPending}
                actionSlot={
                  formData.phone ? (
                    <button
                      type="button"
                      onClick={openPhoneEditModal}
                      className="px-3 py-2 rounded-lg text-sm font-medium"
                      style={{
                        backgroundColor: COLORS.background.base,
                        color: COLORS.text.secondary,
                        border: `1px solid ${COLORS.border.light}`,
                      }}
                      disabled={updateProfileMutation.isPending}
                    >
                      수정
                    </button>
                  ) : null
                }
              />
            </div>
          </SectionCard>

          <SectionCard
            title="맞춤 VIVID 정보"
            description="정확한 AI VIVID를 위해 선택 정보를 입력해주세요."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[#333333]"
                  htmlFor="profile-birth"
                >
                  출생년도
                </label>
                <Input
                  id="profile-birth"
                  type="text"
                  inputMode="numeric"
                  value={formData.birthYear}
                  onChange={(e) => {
                    const cleaned = e.target.value
                      .replace(/[^0-9]/g, "")
                      .slice(0, 4);
                    updateField("birthYear", cleaned);
                    setErrors((prev) => ({ ...prev, birthYear: undefined }));
                  }}
                  placeholder="예) 1994"
                  className="w-full"
                  style={{
                    borderColor: errors.birthYear ? "#EF4444" : "#EFE9E3",
                    backgroundColor: "white",
                  }}
                  disabled={updateProfileMutation.isPending}
                />
                {errors.birthYear && (
                  <p className="mt-1 text-xs text-[#EF4444]">
                    {errors.birthYear}
                  </p>
                )}
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[#333333]"
                  htmlFor="profile-gender"
                >
                  성별
                </label>
                <select
                  id="profile-gender"
                  value={formData.gender}
                  onChange={(e) => {
                    updateField("gender", e.target.value);
                    setErrors((prev) => ({ ...prev, gender: undefined }));
                  }}
                  className="w-full rounded-md border px-3 py-2 text-sm transition-colors"
                  style={{
                    borderColor: errors.gender ? "#EF4444" : "#EFE9E3",
                    backgroundColor: "white",
                    color: formData.gender ? "#333333" : "#9CA3AF",
                  }}
                  disabled={updateProfileMutation.isPending}
                >
                  <option value="">선택해주세요</option>
                  <option value="female">여성</option>
                  <option value="male">남성</option>
                  <option value="other">기타/선택 안함</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-xs text-[#EF4444]">{errors.gender}</p>
                )}
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="소셜 로그인 연동"
            description="카카오 계정을 연동하면 더 편리하게 로그인할 수 있어요."
          >
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
                  <p className="mt-0.5 text-xs text-[#6B7A6F]">
                    {isLoadingKakao
                      ? "확인 중..."
                      : isKakaoLinked
                        ? "연동됨"
                        : "연동되지 않음"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isKakaoLinked ? (
                  <button
                    type="button"
                    onClick={async () => {
                      if (kakaoIdentity) {
                        try {
                          await unlinkKakaoMutation.mutateAsync(kakaoIdentity);
                          // 연동 해제 성공 시 상태 갱신
                          setLinkSuccess(false);
                          // Toast 팝업으로 성공 메시지 표시
                          showToast("카카오 계정 연동이 해제되었습니다.", 4000);
                        } catch (error) {
                          const message =
                            error instanceof Error
                              ? error.message
                              : "연동 해제에 실패했습니다.";
                          setErrors({ general: message });
                        }
                      }
                    }}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: COLORS.background.base,
                      color: COLORS.text.secondary,
                      border: `1px solid ${COLORS.border.light}`,
                    }}
                    disabled={unlinkKakaoMutation.isPending || isLoadingKakao}
                  >
                    {unlinkKakaoMutation.isPending ? "해제 중..." : "연동 해제"}
                  </button>
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
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      backgroundColor: COLORS.brand.primary,
                      color: "white",
                    }}
                    disabled={linkKakaoMutation.isPending || isLoadingKakao}
                  >
                    {linkKakaoMutation.isPending ? "연동 중..." : "연동하기"}
                  </button>
                )}
              </div>
            </div>
            
            {/* 연동 에러 메시지 (연동하기 컴포넌트 바로 아래) */}
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
                  문자/이메일로 서비스 꿀팁, 업데이트, 이벤트 소식을 보내드려요.
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
              Boolean(
                formData.name &&
                  formData.phone &&
                  formData.birthYear &&
                  formData.gender
              ) && !updateProfileMutation.isPending
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
              router.push("/login?deleted=true");
            }, 500);
          }}
        />
      </div>
    </div>
  );
}
