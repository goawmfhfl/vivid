"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { COLORS } from "@/lib/design-system";

export default function AdminDashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/users");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
          style={{ borderColor: COLORS.brand.primary }}
        />
        <p style={{ color: COLORS.text.secondary }}>이동 중...</p>
      </div>
    </div>
  );
}
