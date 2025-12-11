"use client";

import { ProfileSettingsView } from "@/components/ProfileSettingsView";
import { withAuth } from "@/components/auth";

function UserPage() {
  return <ProfileSettingsView />;
}

export default withAuth(UserPage);
