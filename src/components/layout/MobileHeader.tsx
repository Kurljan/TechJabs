"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { User, LogOut, ChevronDown, Settings } from "lucide-react";

export function MobileHeader() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const name = session?.user?.name ?? "User";
  const email = session?.user?.email ?? "";
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-100 px-4 py-2.5 flex items-center justify-between shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8">
          <Image
            src="/techSolveLogo.svg"
            alt="TechSolve Logo"
            fill
            className="object-contain"
            priority
          />
        </div>
        <span className="text-base font-bold text-slate-900 tracking-tight">TechSolve</span>
      </div>

      {/* Profile Button */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="flex items-center gap-1.5 py-1 px-2 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none"
          aria-label="User menu"
        >
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-primary-100">
            {initials}
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
              <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
              {email && (
                <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
              )}
            </div>

            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                <User className="w-4 h-4 text-primary-600" />
              </div>
              <span>My Profile</span>
            </Link>

            <Link
              href="/settings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                <Settings className="w-4 h-4 text-slate-500" />
              </div>
              <span>Settings</span>
            </Link>

            <div className="h-px bg-slate-100 mx-4" />

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
      </div>
    </header>
  );
}
