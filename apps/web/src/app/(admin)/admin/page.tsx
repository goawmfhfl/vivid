"use client";

import { withAdminAuth } from "@/app/(admin)/components/withAdminAuth";
import { AdminDashboard } from "@/app/(admin)/components/AdminDashboard";

function AdminDashboardPage() {
  return <AdminDashboard />;
}

export default withAdminAuth(AdminDashboardPage);
