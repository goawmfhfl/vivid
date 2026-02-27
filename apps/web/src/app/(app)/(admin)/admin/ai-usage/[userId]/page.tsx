"use client";

import { use } from "react";
import { UserAIUsageDetail } from "@/app/(app)/(admin)/components/UserAIUsageDetail";

export default function UserAIUsageDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  return <UserAIUsageDetail userId={userId} />;
}
