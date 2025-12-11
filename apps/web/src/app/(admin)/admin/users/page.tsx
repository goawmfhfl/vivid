"use client";

import { withAdminAuth } from "@/app/(admin)/components/withAdminAuth";
import { UserList } from "@/app/(admin)/components/UserList";

function UserListPage() {
  return <UserList />;
}

export default withAdminAuth(UserListPage);
