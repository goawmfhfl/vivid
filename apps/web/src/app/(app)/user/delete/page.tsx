"use client";

import { withAuth } from "@/components/auth";
import { DeleteAccountPageView } from "@/components/profile/DeleteAccountPageView";

function DeleteAccountPage() {
  return <DeleteAccountPageView />;
}

export default withAuth(DeleteAccountPage);
