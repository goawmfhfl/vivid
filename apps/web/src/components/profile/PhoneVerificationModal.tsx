 "use client";

 import { useEffect, useState } from "react";
 import { CheckCircle2 } from "lucide-react";
 import { PhoneField } from "@/components/forms/PhoneField";
 import { Input } from "@/components/ui/Input";
 import {
   Dialog,
   DialogContent,
   DialogDescription,
   DialogFooter,
   DialogHeader,
   DialogTitle,
 } from "@/components/ui/dialog";
 import { COLORS } from "@/lib/design-system";

interface PhoneVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onApply: (phone: string) => void | Promise<void>;
}

 export function PhoneVerificationModal({
   open,
   onClose,
   onApply,
 }: PhoneVerificationModalProps) {
   const [newPhone, setNewPhone] = useState("");
   const [verificationCode, setVerificationCode] = useState("");
   const [isSendingCode, setIsSendingCode] = useState(false);
   const [isVerifyingCode, setIsVerifyingCode] = useState(false);
   const [phoneEditError, setPhoneEditError] = useState<string | undefined>();
   const [isCodeSent, setIsCodeSent] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isApplying, setIsApplying] = useState(false);

   const normalizedNewPhone = newPhone.replace(/[\s-]/g, "");
   const canSendCode = normalizedNewPhone.length >= 10;

  const resetState = () => {
    setNewPhone("");
    setVerificationCode("");
    setIsSendingCode(false);
    setIsVerifyingCode(false);
    setPhoneEditError(undefined);
    setIsCodeSent(false);
    setIsPhoneVerified(false);
    setVerificationAttempts(0);
    setResendCountdown(0);
    setIsApplying(false);
  };

   useEffect(() => {
     if (!open) {
       resetState();
     }
   }, [open]);

   useEffect(() => {
     if (resendCountdown > 0) {
       const timer = setTimeout(() => {
         setResendCountdown((prev) => Math.max(prev - 1, 0));
       }, 1000);
       return () => clearTimeout(timer);
     }
   }, [resendCountdown]);

   const handleSendVerification = async () => {
     if (!canSendCode) {
       setPhoneEditError("올바른 전화번호를 입력해주세요.");
       return;
     }

     setIsSendingCode(true);
     setPhoneEditError(undefined);
     setVerificationAttempts(0);
     setResendCountdown(300);

     if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
       setIsCodeSent(true);
       setIsSendingCode(false);
       return;
     }

     try {
       const response = await fetch("/api/auth/phone/send", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ phone: newPhone }),
       });
       const data = await response.json().catch(() => ({}));
       if (process.env.NEXT_PUBLIC_NODE_ENV !== "production") {
         console.error("[phone/send] response", response.status, data);
       }
       if (!response.ok) {
         throw new Error(data.error || "인증번호 전송에 실패했습니다.");
       }
       setIsCodeSent(true);
       setPhoneEditError(undefined);
     } catch (error) {
       setPhoneEditError(
         error instanceof Error
           ? error.message
           : "인증번호 전송에 실패했습니다."
       );
     } finally {
       setIsSendingCode(false);
     }
   };

   const registerVerificationFailure = (message?: string) => {
     const nextAttempts = verificationAttempts + 1;
     setVerificationAttempts(nextAttempts);
     const remainingAttempts = Math.max(5 - nextAttempts, 0);
     if (
       message?.includes("인증 시도 횟수를 초과했습니다.") ||
       nextAttempts >= 5
     ) {
       setPhoneEditError("인증 시도 횟수를 초과했습니다. 다시 요청해주세요.");
       setResendCountdown(0);
       return;
     }
     setPhoneEditError(
       `인증번호가 일치하지 않습니다. (${remainingAttempts}회 남음)`
     );
   };

   const handleVerifyCode = async () => {
     if (!verificationCode || verificationCode.length !== 6) {
       setPhoneEditError("인증번호 6자리를 입력해주세요.");
       return;
     }

     setIsVerifyingCode(true);
     setPhoneEditError(undefined);

     if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
       if (verificationCode === "123456") {
         setIsPhoneVerified(true);
         setIsVerifyingCode(false);
         return;
       }
       registerVerificationFailure();
       setIsVerifyingCode(false);
       return;
     }

     try {
       const response = await fetch("/api/auth/phone/verify", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ phone: newPhone, code: verificationCode }),
       });
       const data = await response.json();
       if (!response.ok) {
         throw new Error(data.error || "인증번호가 일치하지 않습니다.");
       }
       setIsPhoneVerified(true);
     } catch (error) {
       const message =
         error instanceof Error
           ? error.message
           : "인증번호가 일치하지 않습니다.";
       registerVerificationFailure(message);
     } finally {
       setIsVerifyingCode(false);
     }
   };

   const shouldResendVerification =
     phoneEditError?.includes("인증 시도 횟수를 초과했습니다.") ||
     verificationAttempts >= 5 ||
     (isCodeSent && resendCountdown === 0);
   const showVerificationSection = isCodeSent;
   const showVerificationInput = isCodeSent && !isPhoneVerified;
   const showVerifiedBadge = isCodeSent && isPhoneVerified;
   const showVerifyButton = showVerificationInput && !shouldResendVerification;
   const showResendButton = showVerificationInput && shouldResendVerification;

   return (
     <Dialog open={open} onOpenChange={onClose}>
       <DialogContent>
         <DialogHeader>
           <DialogTitle>전화번호 변경</DialogTitle>
           <DialogDescription>
             변경할 전화번호를 입력하고
             <br />
             카카오톡 인증을 완료해주세요.
           </DialogDescription>
         </DialogHeader>
         <div className="space-y-4">
           <PhoneField
             value={newPhone}
             onChange={(value) => {
               setNewPhone(value);
               setPhoneEditError(undefined);
               setIsPhoneVerified(false);
               setIsCodeSent(false);
               setVerificationAttempts(0);
             }}
             disabled={isSendingCode || isVerifyingCode}
           />
           {canSendCode && (
             <button
               type="button"
               onClick={handleSendVerification}
               disabled={isSendingCode || isCodeSent}
               className="w-full px-4 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
               style={{
                 backgroundColor: COLORS.brand.primary,
                 color: COLORS.text.white,
               }}
             >
               {isSendingCode ? "전송 중..." : "인증하기"}
             </button>
           )}

           {showVerificationSection && (
             <div className="space-y-2">
               <label
                 className="block text-sm font-medium"
                 style={{ color: COLORS.text.primary }}
               >
                 인증번호
               </label>
               <div
                 className="rounded-lg border px-3 py-2 text-xs"
                 style={{
                   backgroundColor: COLORS.background.hoverLight,
                   borderColor: COLORS.border.light,
                   color: COLORS.text.secondary,
                 }}
               >
                 {isPhoneVerified
                   ? "인증이 완료되었으니 완료 버튼을 눌러주세요."
                   : "카카오톡으로 전송된 인증번호를 입력해주세요."}
               </div>
               {showVerificationInput && (
                 <div className="flex items-center gap-2">
                   <Input
                     value={verificationCode}
                     onChange={(e) => {
                       const value = e.target.value
                         .replace(/[^0-9]/g, "")
                         .slice(0, 6);
                       setVerificationCode(value);
                       setPhoneEditError(undefined);
                     }}
                     placeholder="6자리 인증번호"
                     className="w-full"
                     style={{
                       borderColor: COLORS.border.input,
                       backgroundColor: COLORS.background.base,
                     }}
                     disabled={isVerifyingCode}
                   />
                 </div>
               )}
               {showVerificationInput && phoneEditError && (
                 <p className="text-xs" style={{ color: COLORS.status.error }}>
                   {phoneEditError}
                 </p>
               )}
               {showVerifyButton ? (
                 <button
                   type="button"
                   onClick={handleVerifyCode}
                   disabled={isVerifyingCode || isPhoneVerified}
                   className="w-full px-4 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
                   style={{
                     backgroundColor: isPhoneVerified
                       ? COLORS.status.success
                       : COLORS.brand.primary,
                     color: COLORS.text.white,
                   }}
                 >
                   {isVerifyingCode ? "인증 중..." : "인증 완료"}
                 </button>
               ) : (
                 showResendButton && (
                   <button
                     type="button"
                     onClick={handleSendVerification}
                     disabled={isSendingCode}
                     className="w-full px-4 py-3 rounded-lg text-sm font-medium disabled:opacity-50"
                     style={{
                       backgroundColor: COLORS.brand.primary,
                       color: COLORS.text.white,
                     }}
                   >
                     {isSendingCode ? "재전송 중..." : "재요청하기"}
                   </button>
                 )
               )}
               {showVerifiedBadge && (
                 <div
                   className="w-full rounded-lg border px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2"
                   style={{
                     backgroundColor: COLORS.background.card,
                     borderColor: COLORS.brand.primary,
                     color: COLORS.brand.secondary,
                   }}
                 >
                   <CheckCircle2 className="h-4 w-4" />
                   인증 완료됨
                 </div>
               )}
             </div>
           )}

           {showVerificationInput && resendCountdown > 0 && (
             <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
               유효시간 {Math.floor(resendCountdown / 60)}:
               {String(resendCountdown % 60).padStart(2, "0")}
             </p>
           )}
         </div>
         <DialogFooter>
           <div className="flex w-full items-center justify-between gap-4">
             <button
               type="button"
               onClick={onClose}
               className="flex-1 px-4 py-2 rounded-lg text-sm font-medium border"
               style={{
                 backgroundColor: COLORS.background.base,
                 color: COLORS.text.secondary,
                 borderColor: COLORS.border.light,
               }}
             >
               취소
             </button>
             <button
               type="button"
               onClick={async () => {
                 if (!isPhoneVerified) return;
                setIsApplying(true);
                try {
                  await onApply(newPhone);
                } catch (error) {
                  console.error("전화번호 적용 실패:", error);
                } finally {
                  setIsApplying(false);
                }
              }}
               disabled={!isPhoneVerified || isApplying}
               className="flex-1 px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
               style={{
                 backgroundColor: COLORS.brand.primary,
                 color: COLORS.text.white,
               }}
             >
               {isApplying ? "저장 중..." : "완료"}
             </button>
           </div>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 }
