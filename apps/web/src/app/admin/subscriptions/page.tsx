"use client";

import { withAdminAuth } from "@/components/admin/withAdminAuth";
import { SubscriptionList } from "@/components/admin/SubscriptionList";

function SubscriptionListPage() {
  return <SubscriptionList />;
}

export default withAdminAuth(SubscriptionListPage);
