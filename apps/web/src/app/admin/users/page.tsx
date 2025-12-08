"use client";

import { withAdminAuth } from "@/components/admin/withAdminAuth";
import { UserList } from "@/components/admin/UserList";

function UserListPage() {
  return <UserList />;
}

export default withAdminAuth(UserListPage);
