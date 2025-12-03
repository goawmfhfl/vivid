"use client";

import { useEnvironment } from "@/hooks/useEnvironment";
import { SubscriptionTestPanel } from "@/components/test/SubscriptionTestPanel";
import { AppHeader } from "@/components/common/AppHeader";
import { SPACING } from "@/lib/design-system";

export default function SubscriptionTestPage() {
  const { isTest, isDevelopment } = useEnvironment();

  // 개발 환경이나 테스트 환경에서만 접근 가능
  if (!isTest && !isDevelopment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <p className="text-center">
          이 페이지는 개발 환경에서만 접근할 수 있습니다.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`${SPACING.page.maxWidthNarrow} mx-auto ${SPACING.page.padding} pb-24`}
    >
      <AppHeader
        title="구독 테스트"
        subtitle="구독 상태를 테스트하고 관리할 수 있습니다"
      />

      <SubscriptionTestPanel />
    </div>
  );
}
