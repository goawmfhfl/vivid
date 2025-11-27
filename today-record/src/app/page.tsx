"use client";

import { Home } from "@/components/Home";
import { withAuth } from "@/components/auth";

function RootPage() {
  return <Home />;
}

export default withAuth(RootPage);
