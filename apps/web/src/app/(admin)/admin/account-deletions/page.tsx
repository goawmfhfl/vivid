"use client";

import { withAdminAuth } from "@/app/(admin)/components/withAdminAuth";
import { AccountDeletionsPage } from "@/app/(admin)/components/AccountDeletionsPage";

function AccountDeletionsPageWrapper() {
  return <AccountDeletionsPage />;
}

const WrappedPage = withAdminAuth(AccountDeletionsPageWrapper);

export default WrappedPage;
