"use client";

import { withAdminAuth } from "@/app/(admin)/components/withAdminAuth";
import { SubscriptionList } from "@/app/(admin)/components/SubscriptionList";

function SubscriptionListPage() {
  return <SubscriptionList />;
}

const WrappedPage = withAdminAuth(SubscriptionListPage);
export default WrappedPage;
