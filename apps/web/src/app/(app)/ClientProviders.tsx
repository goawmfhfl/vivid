"use client";

import { JournalProvider } from "../providers";
import { BottomNavigation } from "@/components/common/BottomNavigation";
import { GlobalModals } from "@/components/ui/modals/GlobalModals";

/**
 * 404/에러 페이지를 제외한 앱 전역에만 적용되는 클라이언트 Provider 묶음.
 * 루트 layout은 이 컴포넌트를 사용하지 않아, /404 prerender 시 Context 없이 동작.
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <JournalProvider>
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#e4e2dd" }}>
        <main className="flex-1 hide-scrollbar" style={{ overflowX: "hidden" }}>
          {children}
        </main>
        <BottomNavigation />
        <GlobalModals />
      </div>
    </JournalProvider>
  );
}
