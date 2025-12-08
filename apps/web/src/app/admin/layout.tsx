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
      <main className="flex-1 min-h-screen w-full lg:w-auto">
        <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 max-w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
