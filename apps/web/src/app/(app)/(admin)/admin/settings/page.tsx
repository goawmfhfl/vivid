"use client";

import { useState } from "react";
import { ModalManagementSection } from "@/app/(app)/(admin)/components/ModalManagementSection";
import { COLORS } from "@/lib/design-system";
import { Megaphone } from "lucide-react";

type SettingsTab = "modal";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("modal");

  const tabs: { id: SettingsTab; label: string; icon: typeof Megaphone }[] = [
    { id: "modal", label: "모달 관리", icon: Megaphone },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
          시스템 설정
        </h1>
        <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
          모달과 시스템 설정을 관리합니다.
        </p>
      </div>

      <div className="flex gap-1 p-1 rounded-xl border" style={{ borderColor: COLORS.border.light, backgroundColor: COLORS.background.card }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
            style={
              activeTab === tab.id
                ? { backgroundColor: COLORS.brand.primary, color: COLORS.text.white }
                : { color: COLORS.text.secondary }
            }
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "modal" && <ModalManagementSection />}
    </div>
  );
}
