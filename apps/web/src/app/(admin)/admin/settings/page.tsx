"use client";

import { ModalManagementSection } from "@/app/(admin)/components/ModalManagementSection";
import { COLORS } from "@/lib/design-system";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: COLORS.text.primary }}>
          시스템 설정
        </h1>
        <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
          모달과 시스템 설정을 관리합니다.
        </p>
      </div>
      <ModalManagementSection />
    </div>
  );
}
