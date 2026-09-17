"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Scan,
  Package,
  ShieldCheck,
  TrendingUp,
  ShoppingBag,
  Receipt,
} from "lucide-react";

const navItems = [
  { name: "Home", href: "/dashboard", icon: LayoutDashboard },
  { name: "Stock", href: "/inventory", icon: Package },
  { name: "Scan", href: "/scanner", icon: Scan, featured: true },
  { name: "Sales", href: "/sales", icon: TrendingUp },
  { name: "More", href: "/warranties", icon: ShieldCheck },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-200 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.featured) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center -mt-5"
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    isActive
                      ? "bg-primary-700 scale-110"
                      : "bg-primary-600"
                  }`}
                >
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-primary-600" : "text-slate-400"}`}>
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all"
            >
              <div className={`w-7 h-7 flex items-center justify-center rounded-xl transition-all ${isActive ? "bg-primary-100" : ""}`}>
                <Icon
                  className={`w-5 h-5 transition-colors ${isActive ? "text-primary-600" : "text-slate-400"}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`text-[10px] font-medium transition-colors ${isActive ? "text-primary-600" : "text-slate-400"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
