"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
} from "lucide-react";
import { LogoPlaceholder } from "@/components/Icons";

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
  const [isOpen, setIsOpen] = useState(false);

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
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white transform transition-transform duration-300 ease-in-out shadow-xl md:shadow-none md:translate-x-0 md:static md:inset-auto md:w-64 md:border-r md:border-gray-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
              <LogoPlaceholder className="scale-75" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Techsolve</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="px-4 py-6 space-y-1 overflow-y-auto h-[calc(100vh-80px)]">
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
                onClick={() => setIsOpen(false)} // Close on mobile click
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
      </div>
    </>
  );
}
