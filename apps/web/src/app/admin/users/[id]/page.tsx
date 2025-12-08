"use client";

import { use } from "react";
import { withAdminAuth } from "@/components/admin/withAdminAuth";
import { UserDetail } from "@/components/admin/UserDetail";

function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <UserDetail userId={id} />;
}

export default withAdminAuth(UserDetailPage);
