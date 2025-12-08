"use client";

import { withAdminAuth } from "@/components/admin/withAdminAuth";
import { AIUsagePage } from "@/components/admin/AIUsagePage";

function AIUsagePageWrapper() {
  return <AIUsagePage />;
}

export default withAdminAuth(AIUsagePageWrapper);
