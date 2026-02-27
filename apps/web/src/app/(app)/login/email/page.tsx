"use client";

import { Suspense } from "react";
import { LoginView } from "@/components/login/LoginView";

export default function LoginEmailPage() {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}
