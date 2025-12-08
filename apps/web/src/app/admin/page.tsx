"use client";

import { withAdminAuth } from "@/components/admin/withAdminAuth";
import { AdminDashboard } from "@/components/admin/AdminDashboard";

function AdminDashboardPage() {
  return <AdminDashboard />;
}

export default withAdminAuth(AdminDashboardPage);
