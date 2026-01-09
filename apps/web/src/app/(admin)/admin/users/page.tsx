"use client";

import { withAdminAuth } from "@/app/(admin)/components/withAdminAuth";
import { UserList } from "@/app/(admin)/components/UserList";

function UserListPage() {
  return <UserList />;
}

const WrappedPage = withAdminAuth(UserListPage);
export default WrappedPage;
