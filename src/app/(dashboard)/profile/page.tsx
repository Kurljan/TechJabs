"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import {
  User,
  Mail,
  Lock,
  LogOut,
  Camera,
  Save,
  Shield,
  Bell,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session } = useSession();

  const name = session?.user?.name ?? "User";
  const email = session?.user?.email ?? "";
  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const [displayName, setDisplayName] = useState(name);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-900 mb-1">My Profile</h1>
        <p className="text-slate-500 text-[15px]">Manage your account details and preferences.</p>
      </div>

      {/* Avatar Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-primary-100">
            {initials}
          </div>
          <button
            className="absolute bottom-0 right-0 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
            title="Change photo (coming soon)"
          >
            <Camera className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
        <div>
          <p className="text-lg font-bold text-slate-900">{name}</p>
          <p className="text-sm text-slate-500 mt-0.5">{email}</p>
          <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 rounded-full bg-primary-50 text-primary-700 text-xs font-medium">
            <Shield className="w-3 h-3" />
            Store Owner
          </span>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-600" />
            Personal Information
          </h2>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              Email Address
            </label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-4 py-2.5 border border-slate-100 rounded-xl text-sm text-slate-500 bg-slate-50 cursor-not-allowed"
            />
            <p className="text-xs text-slate-400 mt-1">Email cannot be changed.</p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <Save className="w-4 h-4" />
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary-600" />
            Security
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Confirm New Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
            />
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
            >
              <Lock className="w-4 h-4" />
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary-600" />
            Notifications
          </h2>
        </div>
        <div className="p-6 space-y-4">
          {[
            { label: "Warranty expiry alerts", desc: "Notify me before a warranty expires", defaultOn: true },
            { label: "Low stock alerts", desc: "Notify me when inventory is running low", defaultOn: true },
            { label: "New sale recorded", desc: "Notify me when a new sale is added", defaultOn: false },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-800">{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-primary-600 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100">
          <h2 className="text-base font-semibold text-red-600 flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Session
          </h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-slate-500 mb-4">
            You are signed in as <span className="font-semibold text-slate-700">{email}</span>.
            Signing out will end your current session.
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
