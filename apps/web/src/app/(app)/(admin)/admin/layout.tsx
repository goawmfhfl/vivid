"use client";

import { AdminSidebar } from "@/app/(app)/(admin)/components/AdminSidebar";
import { AdminAuthProvider } from "@/app/(app)/(admin)/components/AdminAuthContext";
import { COLORS } from "@/lib/design-system";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div
        className="flex h-screen overflow-hidden"
        style={{ backgroundColor: COLORS.background.base }}
      >
        <AdminSidebar />
        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </AdminAuthProvider>
  );
}
