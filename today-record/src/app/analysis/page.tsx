"use client";

import { SummariesView } from "@/components/SummariesView";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SummariesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 기본값 설정: tab 파라미터가 없으면 weekly로 리다이렉트
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (!tab) {
      router.replace("/analysis?tab=weekly");
    }
  }, [router, searchParams]);

  // tab 파라미터가 없으면 로딩 표시 (리다이렉트 중)
  if (!searchParams.get("tab")) {
    return null;
  }

  return <SummariesView />;
}

export default function SummariesPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: "#EFE9E3" }}
              >
                <div
                  className="w-8 h-8 rounded-full"
                  style={{ backgroundColor: "#6B7A6F" }}
                />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <SummariesPageContent />
    </Suspense>
  );
}
