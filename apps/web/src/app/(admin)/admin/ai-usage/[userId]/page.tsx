"use client";

import { use } from "react";
import { withAdminAuth } from "@/app/(admin)/components/withAdminAuth";
import { UserAIUsageDetail } from "@/app/(admin)/components/UserAIUsageDetail";

function UserAIUsageDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  return <UserAIUsageDetail userId={userId} />;
}

const WrappedPage = withAdminAuth(UserAIUsageDetailPage);
export default WrappedPage;
