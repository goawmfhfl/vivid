"use client";

import { Suspense } from "react";
import { LoginLandingView } from "@/components/login/LoginLandingView";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginLandingView />
    </Suspense>
  );
}
