import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { verifySession } from "@/lib/session";
import { getAdminSidebarStats } from "@/services/statisticsService";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin · Spill the Tea",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}

async function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [session, weekStat] = await Promise.all([
    verifySession(),
    getAdminSidebarStats(),
  ]);
  const initials = session.nickname[0] ?? "";

  // Subtract the header height from the root layout
  const heightClass = "h-[calc(100vh-14*var(--spacing))]";

  return (
    <div className={`bg-cream flex overflow-hidden ${heightClass}`}>
      <AdminSidebar
        manager={{
          name: session.nickname,
          picture: session.picture,
          initials,
          role: "Admin",
        }}
        weekStat={weekStat}
      />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
