import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-[100dvh] bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content scrollable area */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {/* Mobile top header */}
        <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">TS</span>
            </div>
            <span className="text-base font-bold text-slate-900">TechSolve</span>
          </div>
          <span className="text-xs text-slate-400">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </header>

        {/* Page content with bottom padding for BottomNav */}
        <main className="p-4 pb-24 md:p-8 md:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
