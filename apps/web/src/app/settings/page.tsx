"use client";

import { ProfileSettingsView } from "@/components/ProfileSettingsView";
import { withAuth } from "@/components/auth";

function SettingsPage() {
  return <ProfileSettingsView />;
}

export default withAuth(SettingsPage);
