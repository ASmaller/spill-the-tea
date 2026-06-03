import { Sidebar } from "@/components/admin/Sidebar";
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
  const name = `${session.given_name} ${session.family_name}`.trim();
  const initials = `${session.given_name[0] ?? ""}${
    session.family_name[0] ?? ""
  }`.toUpperCase();

  return (
    <div className="bg-cream flex h-screen overflow-hidden">
      <Sidebar
        manager={{
          name,
          initials,
          role: "Lunch manager",
          school: "Chalmers · kårrestaurangen",
        }}
        weekStat={weekStat}
      />
      <main className="flex flex-1 flex-col overflow-hidden">{children}</main>
    </div>
  );
}
