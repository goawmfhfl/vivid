"use client";

import { withAdminAuth } from "@/components/admin/withAdminAuth";
import { UserDetail } from "@/components/admin/UserDetail";

function UserDetailPage({ params }: { params: { id: string } }) {
  return <UserDetail userId={params.id} />;
}

export default withAdminAuth(UserDetailPage);
