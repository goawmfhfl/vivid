"use client";

import { LogView } from "@/components/LogView";
import { withAuth } from "@/components/auth";

function LogsPage() {
  return <LogView />;
}

export default withAuth(LogsPage);
