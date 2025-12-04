"use client";

import { useEnvironment } from "@/hooks/useEnvironment";
import { SubscriptionTestPanel } from "@/components/test/SubscriptionTestPanel";
import { TokenTestPanel } from "@/components/test/TokenTestPanel";
import { AppHeader } from "@/components/common/AppHeader";
import { SPACING } from "@/lib/design-system";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
        title="테스트 페이지"
        subtitle="다양한 기능을 테스트하고 확인할 수 있습니다"
      />

      <Tabs defaultValue="subscription" className="space-y-6 mt-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscription">구독 테스트</TabsTrigger>
          <TabsTrigger value="token">토큰 테스트</TabsTrigger>
        </TabsList>
        <TabsContent value="subscription">
          <SubscriptionTestPanel />
        </TabsContent>
        <TabsContent value="token">
          <TokenTestPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
