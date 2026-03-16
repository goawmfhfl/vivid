"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS, CARD_STYLES, SPACING, TYPOGRAPHY, hexToRgba } from "@/lib/design-system";
import { cn } from "@/lib/utils";

export function DeleteAccountRequestCompletedView() {
  const router = useRouter();

  return (
    <div className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-20`}>
      <section
        className={cn(SPACING.card.padding, "rounded-2xl text-center space-y-4")}
        style={{ ...CARD_STYLES.default }}
      >
        <div className="mx-auto w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: hexToRgba(COLORS.status.success, 0.2) }}>
          <CheckCircle2 className="w-7 h-7" style={{ color: COLORS.status.successDark }} />
        </div>

        <h1
          className={cn(TYPOGRAPHY.h2.fontSize, TYPOGRAPHY.h2.fontWeight)}
          style={{ color: COLORS.text.primary }}
        >
          제출이 완료되었습니다
        </h1>

        <p
          className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}
          style={{ color: COLORS.text.secondary }}
        >
          계정 삭제 요청이 정상적으로 접수되었습니다.
          <br />
          입력하신 이메일로 필요 시 추가 안내를 드립니다.
        </p>

        <div className="pt-2 space-y-2">
          <Button
            type="button"
            className="w-full"
            style={{
              backgroundColor: COLORS.brand.primary,
              color: COLORS.text.white,
            }}
            onClick={() => router.push("/account-deletion-request")}
          >
            새 요청 작성하기
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            style={{
              borderColor: COLORS.border.input,
              color: COLORS.text.secondary,
              backgroundColor: COLORS.background.base,
            }}
            onClick={() => router.push("/")}
          >
            홈으로 이동
          </Button>
        </div>
      </section>
    </div>
  );
}
