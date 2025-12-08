import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { COLORS } from "@/lib/design-system";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: COLORS.background.base }}
    >
      <AdminSidebar />
      <main className="flex-1 lg:ml-64 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">{children}</div>
      </main>
    </div>
  );
}
