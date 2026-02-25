"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /admin/ai-usage -> /admin/usage 리다이렉트 (사용량 탭으로 통합됨)
 */
export default function AIUsageRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/usage");
  }, [router]);
  return null;
}
