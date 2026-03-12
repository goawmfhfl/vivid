"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/lib/design-system";

export function PolicyBackButton() {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="mb-6 -ml-2"
      style={{ color: COLORS.brand.primary }}
      onClick={() => router.back()}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      돌아가기
    </Button>
  );
}
