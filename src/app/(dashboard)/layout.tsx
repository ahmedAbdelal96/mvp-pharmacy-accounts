import SidebarNav from "./SidebarNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar — server shell with client nav */}
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
      <main className="flex-1 min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-zinc-200 px-6 py-3 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600">مدير النظام</span>
            <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-sm font-medium">
              م
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}