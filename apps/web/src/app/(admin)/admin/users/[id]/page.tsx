"use client";

import { use } from "react";
import { withAdminAuth } from "@/app/(admin)/components/withAdminAuth";
import { UserDetail } from "@/app/(admin)/components/UserDetail";

function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <UserDetail userId={id} />;
}

export default withAdminAuth(UserDetailPage);
