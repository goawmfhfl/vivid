"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, Mail, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { NameField } from "../forms/NameField";
import { PhoneField } from "../forms/PhoneField";
import { SubmitButton } from "../forms/SubmitButton";
import { useFindEmail } from "@/hooks/useFindEmail";
import { COLORS } from "@/lib/design-system";
import { FindPasswordDialog } from "./FindPasswordDialog";

interface FindEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FindEmailDialog({ open, onOpenChange }: FindEmailDialogProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    general?: string;
  }>({});
  const [success, setSuccess] = useState(false);
  const [foundEmails, setFoundEmails] = useState<string[]>([]);
  const [findPasswordDialogOpen, setFindPasswordDialogOpen] = useState(false);

  const findEmailMutation = useFindEmail();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setFoundEmails([]);

    const newErrors: typeof errors = {};

    // 이름과 전화번호 모두 필수
    if (!name || name.trim() === "") {
      newErrors.name = "이름을 입력해주세요.";
    }
    if (!phone || phone.trim() === "") {
      newErrors.phone = "전화번호를 입력해주세요.";
    } else {
      const phoneRegex = /^[0-9-]+$/;
      const cleanedPhone = phone.replace(/\s/g, "");
      if (!phoneRegex.test(cleanedPhone) || cleanedPhone.length < 10) {
        newErrors.phone = "올바른 전화번호 형식을 입력해주세요.";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      const result = await findEmailMutation.mutateAsync({ name, phone });
      setFoundEmails(result.emails || []);
      setSuccess(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setErrors({ general: message });
    }
  };

  const handleClose = () => {
    setName("");
    setPhone("");
    setErrors({});
    setSuccess(false);
    setFoundEmails([]);
    onOpenChange(false);
  };

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      // 간단한 피드백은 생략하거나 토스트로 표시 가능
    } catch (err) {
      console.error("복사 실패:", err);
    }
  };

  const handleOpenPasswordDialog = () => {
    onOpenChange(false);
    setTimeout(() => {
      setFindPasswordDialogOpen(true);
    }, 100);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          {!success && (
            <DialogHeader>
              <DialogTitle style={{ color: "#333333" }}>
                이메일 찾기
              </DialogTitle>
              <DialogDescription style={{ color: "#6B7A6F" }}>
                가입 시 입력하신 이름과 전화번호를 모두 입력해주세요.
              </DialogDescription>
            </DialogHeader>
          )}

          {success ? (
            <div className="space-y-6 py-4">
              {foundEmails.length > 0 ? (
                <>
                  {/* 성공 아이콘 */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: "#F0FDF4" }}
                    >
                      <CheckCircle2
                        className="w-8 h-8"
                        style={{ color: COLORS.status.success }}
                      />
                    </div>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: COLORS.text.primary }}
                    >
                      이메일을 찾았습니다
                    </h3>
                    <p
                      className="text-sm text-center mb-6"
                      style={{ color: COLORS.text.tertiary }}
                    >
                      등록된 이메일 주소입니다
                    </p>
                  </div>

                  {/* 이메일 목록 */}
                  <div className="space-y-3">
                    {foundEmails.map((email, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-4 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{
                          borderColor: COLORS.border.light,
                          backgroundColor: COLORS.background.card,
                        }}
                      >
                        <Mail
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: COLORS.text.tertiary }}
                        />
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-base font-medium break-all"
                            style={{ color: COLORS.text.primary }}
                          >
                            {email}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(email)}
                          className="p-2 rounded-lg transition-colors flex-shrink-0"
                          style={{
                            backgroundColor: COLORS.background.hover,
                            color: COLORS.text.tertiary,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              COLORS.brand.light + "40";
                            e.currentTarget.style.color = COLORS.brand.primary;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              COLORS.background.hover;
                            e.currentTarget.style.color = COLORS.text.tertiary;
                          }}
                          title="이메일 복사"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 안내 메시지 */}
                  <p
                    className="text-xs text-center"
                    style={{ color: COLORS.text.tertiary }}
                  >
                    비밀번호를 잊으셨다면{" "}
                    <button
                      type="button"
                      onClick={handleOpenPasswordDialog}
                      className="underline font-medium transition-colors"
                      style={{ color: COLORS.brand.primary }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = COLORS.brand.dark;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = COLORS.brand.primary;
                      }}
                    >
                      비밀번호 찾기
                    </button>
                    를 이용해주세요.
                  </p>
                </>
              ) : (
                <>
                  {/* 계정을 찾을 수 없을 때 */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: "#FEF2F2" }}
                    >
                      <AlertCircle
                        className="w-8 h-8"
                        style={{ color: COLORS.status.error }}
                      />
                    </div>
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: COLORS.text.primary }}
                    >
                      계정을 찾을 수 없습니다
                    </h3>
                    <div className="text-center space-y-2 mb-6">
                      <p
                        className="text-sm"
                        style={{ color: COLORS.text.secondary }}
                      >
                        입력하신 정보와 일치하는 계정을 찾을 수 없습니다.
                        <br />
                        이름과 전화번호를 정확히 입력해주세요.
                      </p>
                      <p
                        className="text-xs mt-4"
                        style={{ color: COLORS.text.tertiary }}
                      >
                        회원가입 시 이름/전화번호를 입력하지 않으셨다면,
                        <br />
                        <button
                          type="button"
                          onClick={handleOpenPasswordDialog}
                          className="underline font-medium transition-colors"
                          style={{ color: COLORS.brand.primary }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = COLORS.brand.dark;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = COLORS.brand.primary;
                          }}
                        >
                          비밀번호 찾기
                        </button>
                        를 통해 이메일을 확인하실 수 있습니다.
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* 확인 버튼 */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-lg transition-colors font-medium"
                  style={{
                    backgroundColor: COLORS.brand.primary,
                    color: COLORS.text.white,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = COLORS.brand.dark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      COLORS.brand.primary;
                  }}
                >
                  확인
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* General Error */}
              {errors.general && (
                <div
                  className="p-4 rounded-lg flex items-center gap-2"
                  style={{
                    backgroundColor: "#FEE2E2",
                    border: "1px solid #EF4444",
                  }}
                >
                  <AlertCircle
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: "#EF4444" }}
                  />
                  <p style={{ color: "#991B1B", fontSize: "0.9rem" }}>
                    {errors.general}
                  </p>
                </div>
              )}

              <NameField
                value={name}
                onChange={(value) => {
                  setName(value);
                  setErrors((prev) => ({
                    ...prev,
                    name: undefined,
                    general: undefined,
                  }));
                }}
                placeholder="이름을 입력하세요"
                error={errors.name}
                disabled={findEmailMutation.isPending}
              />

              <PhoneField
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  setErrors((prev) => ({
                    ...prev,
                    phone: undefined,
                    general: undefined,
                  }));
                }}
                error={errors.phone}
                disabled={findEmailMutation.isPending}
              />

              <SubmitButton
                isLoading={findEmailMutation.isPending}
                isValid={Boolean(name && name.trim() && phone && phone.trim())}
                loadingText="확인 중..."
                defaultText="이메일 찾기"
              />
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* 비밀번호 찾기 다이얼로그 - Dialog 밖에 배치 */}
      <FindPasswordDialog
        open={findPasswordDialogOpen}
        onOpenChange={setFindPasswordDialogOpen}
      />
    </>
  );
}
