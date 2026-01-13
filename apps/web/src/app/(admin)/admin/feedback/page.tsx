"use client";

import { withAdminAuth } from "@/app/(admin)/components/withAdminAuth";
import { FeedbackManagementPage } from "@/app/(admin)/components/FeedbackManagementPage";

function FeedbackPage() {
  return <FeedbackManagementPage />;
}

const WrappedPage = withAdminAuth(FeedbackPage);

export default WrappedPage;
