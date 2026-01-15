"use client";

 import { CheckCircle2, XCircle } from "lucide-react";
 import {
   COLORS,
   GRADIENT_UTILS,
   hexToRgba,
 } from "@/lib/design-system";
 import type { Coupon } from "@/types/coupon";

 interface CouponTicketProps {
   coupon: Coupon | null;
   codeDisplay: string;
   isValid: boolean;
   isUsed: boolean;
   isSoldOut: boolean;
   isApplying?: boolean;
   invalidMessage?: string;
   onApply?: () => void;
   size?: "default" | "compact";
  statusMessage?: string;
 }

 const SIZE_STYLES = {
   default: {
     outerRadius: "rounded-3xl",
     leftPadding: "p-6 sm:p-7",
     rightPadding: "p-6 sm:p-7",
     title: "text-lg",
     label: "text-xs",
     value: "text-base sm:text-lg",
     code: "text-lg",
     button: "px-4 py-3",
     perforationPadding: "px-6",
     perforationSize: "h-5 w-5",
   },
   compact: {
     outerRadius: "rounded-2xl",
     leftPadding: "p-4",
     rightPadding: "p-4",
     title: "text-base",
     label: "text-[11px]",
     value: "text-sm",
     code: "text-base",
     button: "px-3 py-2.5 text-sm",
     perforationPadding: "px-4",
     perforationSize: "h-4 w-4",
   },
 } as const;

 export function CouponTicket({
   coupon,
   codeDisplay,
   isValid,
   isUsed,
   isSoldOut,
   isApplying = false,
   invalidMessage,
   onApply,
   size = "default",
  statusMessage,
 }: CouponTicketProps) {
   const styles = SIZE_STYLES[size];
   const showStateBlock = isUsed || isSoldOut;
   const isDisabled = isApplying || isUsed || isSoldOut || !isValid;

   return (
     <div className="relative">
       <div
         className={`${styles.outerRadius} p-0 relative overflow-hidden`}
         style={{
           background: GRADIENT_UTILS.cardBackground(
             COLORS.brand.light,
             0.12,
             COLORS.background.card
           ),
           border: `1.5px solid ${
             isValid
               ? showStateBlock
                 ? COLORS.status.warning
                 : COLORS.border.light
               : COLORS.status.error
           }`,
           boxShadow: `0 8px 24px ${hexToRgba(
             showStateBlock ? COLORS.status.warning : COLORS.brand.primary,
             0.12
           )}`,
         }}
       >
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-[1.3fr_0.9fr]">
           <div
             className={styles.leftPadding}
             style={{
               backgroundColor: COLORS.background.card,
             }}
           >
             {isValid ? (
               <>
                 <div className="flex items-center gap-2 mb-4">
                   <CheckCircle2
                     className="w-5 h-5"
                     style={{
                       color: showStateBlock
                         ? COLORS.status.warning
                         : COLORS.status.success,
                     }}
                   />
                   <h3
                     className={`${styles.title} font-semibold`}
                     style={{ color: COLORS.text.primary }}
                   >
                     쿠폰 정보
                   </h3>
                 </div>

                 <div className="space-y-3">
                   <div>
                     <span
                       className={`${styles.label} font-medium uppercase tracking-wide`}
                       style={{ color: COLORS.text.tertiary }}
                     >
                       Coupon Name
                     </span>
                     <p
                       className={`mt-1 ${styles.value} font-semibold`}
                       style={{ color: COLORS.text.primary }}
                     >
                       {coupon?.name || ""}
                     </p>
                   </div>
                   <div>
                     <span
                       className={`${styles.label} font-medium uppercase tracking-wide`}
                       style={{ color: COLORS.text.tertiary }}
                     >
                       사용 기간
                     </span>
                     <p
                       className={`mt-1 ${styles.value}`}
                       style={{ color: COLORS.text.primary }}
                     >
                       {coupon?.duration_days ?? 0}일
                     </p>
                   </div>
                 </div>
               </>
             ) : (
               <div className="flex items-start gap-2">
                 <XCircle
                   className="w-5 h-5 mt-0.5"
                   style={{ color: COLORS.status.error }}
                 />
                 <div>
                   <p
                     className="text-base font-medium"
                     style={{ color: COLORS.status.error }}
                   >
                     {invalidMessage || "유효하지 않은 쿠폰입니다."}
                   </p>
                 </div>
               </div>
             )}
           </div>

           <div
             className={`relative ${styles.rightPadding}`}
             style={{ backgroundColor: COLORS.background.cardElevated }}
           >
             <div className="relative z-10 flex flex-col gap-4">
               <div className="flex items-center justify-between">
                 <span
                   className={`${styles.label} font-semibold uppercase tracking-[0.2em]`}
                   style={{ color: COLORS.text.tertiary }}
                 >
                   VIVID Ticket
                 </span>
               </div>
               <div>
                 <p
                   className={`${styles.label} uppercase tracking-[0.2em]`}
                   style={{ color: COLORS.text.tertiary }}
                 >
                   Coupon Code
                 </p>
                 <p
                   className={`mt-2 ${styles.code} font-semibold`}
                   style={{ color: COLORS.text.primary }}
                 >
                   {codeDisplay || "— — — —"}
                 </p>
               </div>
              {statusMessage && !showStateBlock && (
                <div
                  className="rounded-full px-4 py-2 text-sm font-semibold text-center"
                  style={{
                    background: GRADIENT_UTILS.cardBackground(
                      COLORS.brand.primary,
                      0.14,
                      COLORS.background.cardElevated
                    ),
                    color: COLORS.text.primary,
                    border: `1px solid ${GRADIENT_UTILS.borderColor(
                      COLORS.brand.primary,
                      "30"
                    )}`,
                    boxShadow: `0 4px 12px ${hexToRgba(
                      COLORS.brand.primary,
                      0.18
                    )}`,
                  }}
                >
                  {statusMessage}
                </div>
              )}
               {showStateBlock && (
                 <div
                   className="rounded-xl px-4 py-3 text-sm font-semibold text-center"
                   style={{
                     backgroundColor: COLORS.background.hover,
                     color: COLORS.text.secondary,
                     border: `1px solid ${COLORS.border.light}`,
                   }}
                 >
                   {isSoldOut
                     ? "쿠폰이 모두 소진되었습니다."
                     : "이미 사용한 쿠폰입니다."}
                 </div>
               )}
               {onApply && (
                 <button
                   onClick={onApply}
                   disabled={isDisabled}
                   className={`w-full rounded-lg disabled:opacity-50 font-medium ${styles.button}`}
                   style={{
                     backgroundColor: isDisabled
                       ? COLORS.background.hover
                       : COLORS.brand.primary,
                     color: isDisabled
                       ? COLORS.text.tertiary
                       : COLORS.text.white,
                   }}
                 >
                   {isApplying ? "적용 중..." : "사용하기"}
                 </button>
               )}
             </div>
           </div>
         </div>

         <div
           className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center gap-3 ${styles.perforationPadding}`}
           aria-hidden="true"
         >
           <div
             className={`${styles.perforationSize} rounded-full`}
             style={{
               backgroundColor: COLORS.background.base,
               border: `1.5px solid ${COLORS.border.light}`,
             }}
           />
           <div
             className="flex-1 border-t border-dashed"
             style={{ borderColor: COLORS.border.light }}
           />
           <div
             className={`${styles.perforationSize} rounded-full`}
             style={{
               backgroundColor: COLORS.background.base,
               border: `1.5px solid ${COLORS.border.light}`,
             }}
           />
         </div>
       </div>
     </div>
   );
 }
