"use client";

import { withAdminAuth } from "@/components/admin/withAdminAuth";
import { ContentStatsPage } from "@/components/admin/ContentStatsPage";

function ContentStatsPageWrapper() {
  return <ContentStatsPage />;
}

export default withAdminAuth(ContentStatsPageWrapper);
