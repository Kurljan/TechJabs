"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Scan,
  BookMarked,
  ShieldCheck,
  TrendingUp,
  Receipt,
  ShoppingBag,
  X,
  Menu,
  User,
  LogOut,
  ChevronUp,
  Settings,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "AI Scanner", href: "/scanner", icon: Scan },
  { name: "Inventory", href: "/inventory", icon: BookMarked },
  { name: "Warranties", href: "/warranties", icon: ShieldCheck },
  { name: "Sales", href: "/sales", icon: TrendingUp },
  { name: "Purchases", href: "/purchases", icon: ShoppingBag },
  { name: "Receipts", href: "/receipts", icon: Receipt },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const name = session?.user?.name ?? "User";
  const email = session?.user?.email ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <button
          onClick={() => setIsOpen(true)}
          className="text-gray-900 hover:text-gray-700 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="text-sm font-medium text-gray-700">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out shadow-xl md:shadow-none md:translate-x-0 md:static md:inset-auto md:w-64 md:border-r md:border-gray-200 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="relative w-9 h-9">
              <Image
                src="/techSolveLogo.svg"
                alt="TechSolve Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">TechSolve</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-6 space-y-1 overflow-y-auto flex-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard");

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? "bg-primary-100 text-primary-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <item.icon
                  className={`w-5 h-5 ${isActive ? "text-primary-600" : "text-gray-900"}`}
                  strokeWidth={2}
                />
                <span className="text-base">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* User Card (bottom) */}
        <div className="flex-shrink-0 border-t border-gray-100 p-3" ref={userMenuRef}>
          {/* Popup menu — opens upward */}
          {userMenuOpen && (
            <div className="mb-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
              {/* User info */}
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
                {email && <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>}
              </div>

              {/* Profile */}
              <Link
                href="/profile"
                onClick={() => { setUserMenuOpen(false); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <span>My Profile</span>
              </Link>

              {/* Settings */}
              <Link
                href="/settings"
                onClick={() => { setUserMenuOpen(false); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Settings className="w-4 h-4 text-slate-500" />
                </div>
                <span>Settings</span>
              </Link>

              <div className="h-px bg-slate-100 mx-4" />

              {/* Logout */}
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center">
                  <LogOut className="w-4 h-4 text-red-500" />
                </div>
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          )}

          {/* Trigger button */}
          <button
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-bold ring-2 ring-primary-100 flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
              {email && <p className="text-xs text-slate-500 truncate">{email}</p>}
            </div>
            <ChevronUp
              className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${userMenuOpen ? "" : "rotate-180"}`}
            />
          </button>
        </div>
      </div>
    </>
  );
}

