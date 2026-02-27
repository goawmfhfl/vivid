"use client";

import { Suspense } from "react";
import { MyInfoView } from "@/components/my-info/MyInfoView";
import { AppHeader } from "@/components/common/AppHeader";
import { SPACING } from "@/lib/design-system";

function MyInfoPageContent() {
  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader title="내정보" />
      <MyInfoView />
    </div>
  );
}

export default function MyInfoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen p-8">로딩 중...</div>}>
      <MyInfoPageContent />
    </Suspense>
  );
}
