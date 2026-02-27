"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { COLORS, TYPOGRAPHY } from "@/lib/design-system";
import { cn } from "@/lib/utils";
import { BarChart3, LineChart } from "lucide-react";
import { AIUsagePage } from "@/app/(app)/(admin)/components/AIUsagePage";
import AdminAnalyticsPage from "../analytics/page";

type UsageTab = "ai-usage" | "analytics";

export default function AdminUsagePage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams?.get("tab") as UsageTab | null;
  const [activeTab, setActiveTab] = useState<UsageTab>(
    tabParam === "analytics" ? "analytics" : "ai-usage"
  );

  useEffect(() => {
    if (tabParam === "analytics" || tabParam === "ai-usage") {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const tabs: { id: UsageTab; label: string; icon: typeof BarChart3 }[] = [
    { id: "ai-usage", label: "AI 사용량", icon: BarChart3 },
    { id: "analytics", label: "사용 분석", icon: LineChart },
  ];

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h1
          className={cn(
            TYPOGRAPHY.h2.fontSize,
            TYPOGRAPHY.h2.fontWeight,
            TYPOGRAPHY.h2.lineHeight
          )}
          style={{ color: TYPOGRAPHY.h2.color }}
        >
          사용량
        </h1>
        <p className={cn(TYPOGRAPHY.body.fontSize, TYPOGRAPHY.body.lineHeight)}>
          AI 사용량과 사용 분석을 확인하고 관리하세요.
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div
        className="flex flex-wrap gap-2 pb-4 border-b"
        style={{ borderColor: COLORS.border.light }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                activeTab === tab.id ? "font-semibold" : ""
              )}
              style={{
                backgroundColor:
                  activeTab === tab.id ? COLORS.brand.light + "30" : "transparent",
                color:
                  activeTab === tab.id ? COLORS.brand.primary : COLORS.text.secondary,
              }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === "ai-usage" && <AIUsagePage />}
      {activeTab === "analytics" && <AdminAnalyticsPage />}
    </div>
  );
}
