"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { withAuth } from "@/components/auth";

function AnalysisPage() {
  const router = useRouter();

  useEffect(() => {
    // /analysis 페이지를 /reports로 리다이렉트
    router.replace("/reports");
  }, [router]);

  return null;
}

export default withAuth(AnalysisPage);
