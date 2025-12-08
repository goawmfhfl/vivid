"use client";

import { withAdminAuth } from "@/components/admin/withAdminAuth";
import { UserAIUsageDetail } from "@/components/admin/UserAIUsageDetail";

function UserAIUsageDetailPage({ params }: { params: { userId: string } }) {
  return <UserAIUsageDetail userId={params.userId} />;
}

export default withAdminAuth(UserAIUsageDetailPage);
