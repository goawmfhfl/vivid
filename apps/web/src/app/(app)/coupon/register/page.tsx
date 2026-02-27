"use client";

import { Suspense } from "react";
import { CouponRegisterView } from "@/components/coupon/CouponRegisterView";
import { AppHeader } from "@/components/common/AppHeader";
import { SPACING } from "@/lib/design-system";

function CouponRegisterContent() {
  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader title="쿠폰 등록" showBackButton={true} />
      <CouponRegisterView />
    </div>
  );
}

export default function CouponRegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8">로딩 중...</div>}>
      <CouponRegisterContent />
    </Suspense>
  );
}
