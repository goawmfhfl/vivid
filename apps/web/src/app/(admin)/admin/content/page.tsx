"use client";

import { withAdminAuth } from "@/app/(admin)/components/withAdminAuth";
import { ContentStatsPage } from "@/app/(admin)/components/ContentStatsPage";

function ContentStatsPageWrapper() {
  return <ContentStatsPage />;
}

export default withAdminAuth(ContentStatsPageWrapper);
