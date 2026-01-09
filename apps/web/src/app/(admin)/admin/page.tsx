"use client";

import { withAdminAuth } from "@/app/(admin)/components/withAdminAuth";
import { AdminDashboard } from "@/app/(admin)/components/AdminDashboard";

function AdminDashboardPage() {
  return <AdminDashboard />;
}

const WrappedPage = withAdminAuth(AdminDashboardPage);
export default WrappedPage;
