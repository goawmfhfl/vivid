"use client";

import { withAdminAuth } from "@/app/(admin)/components/withAdminAuth";
import { AIUsagePage } from "@/app/(admin)/components/AIUsagePage";

function AIUsagePageWrapper() {
  return <AIUsagePage />;
}

const WrappedPage = withAdminAuth(AIUsagePageWrapper);
export default WrappedPage;
