"use client";

import { use } from "react";
import { withAdminAuth } from "@/components/admin/withAdminAuth";
import { UserAIUsageDetail } from "@/components/admin/UserAIUsageDetail";

function UserAIUsageDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  return <UserAIUsageDetail userId={userId} />;
}

export default withAdminAuth(UserAIUsageDetailPage);
