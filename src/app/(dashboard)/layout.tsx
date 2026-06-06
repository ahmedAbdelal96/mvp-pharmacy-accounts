import { getCurrentUser } from "@/lib/auth/get-current-user";
import TopBar from "./TopBar";
import SidebarNav from "./SidebarNav";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side auth check — never trusts client
  const user = await getCurrentUser();

  // If not authenticated, middleware already redirected to /login
  // but as a safety net, we also redirect here
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-zinc-200 flex flex-col">
        {/* Logo / Brand */}
        <div className="p-4 border-b border-zinc-200">
          <h1 className="text-lg font-bold text-zinc-900">صيدلية حسابات</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Pharmacy Accounts Lite</p>
        </div>

        {/* Navigation — client component for usePathname */}
        <SidebarNav />

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200">
          <div className="text-xs text-zinc-400 text-center">
            الإصدار 0.1.0 — MVP
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen flex flex-col">
        {/* Top bar with user info + logout */}
        <TopBar user={user} />

        {/* Page content */}
        <div className="p-6 flex-1">{children}</div>
      </main>
    </div>
  );
}