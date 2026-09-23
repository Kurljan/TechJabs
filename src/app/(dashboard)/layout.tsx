import { Sidebar } from "@/components/layout/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileHeader } from "@/components/layout/MobileHeader";

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
        <MobileHeader />

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
