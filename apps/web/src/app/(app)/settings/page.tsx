"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { withAuth } from "@/components/auth";

function SettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // /settings 페이지를 /user로 리다이렉트
    router.replace("/user");
  }, [router]);

  return null;
}

export default withAuth(SettingsPage);
