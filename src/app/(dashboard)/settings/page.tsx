"use client";

import { useSession } from "next-auth/react";
import { Settings, Bell, Shield, Palette, Globe } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = useSession();

  const sections = [
    {
      icon: Shield,
      title: "Account & Security",
      desc: "Manage your profile, password and sign-in preferences.",
      href: "/profile",
      color: "bg-primary-50 text-primary-600",
    },
    {
      icon: Bell,
      title: "Notifications",
      desc: "Configure alerts for warranties, stock, and sales.",
      href: "/profile",
      color: "bg-amber-50 text-amber-600",
    },
    {
      icon: Palette,
      title: "Appearance",
      desc: "Customize the look and feel of your dashboard.",
      href: "#",
      color: "bg-purple-50 text-purple-600",
    },
    {
      icon: Globe,
      title: "Language & Region",
      desc: "Set your preferred language, currency and time zone.",
      href: "#",
      color: "bg-teal-50 text-teal-600",
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-slate-900 mb-1">Settings</h1>
        <p className="text-slate-500 text-[15px]">
          Manage your app preferences and account configuration.
        </p>
      </div>

      <div className="grid gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.title}
              href={s.href}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:border-primary-200 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center flex-shrink-0 ${s.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900">{s.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.desc}</p>
              </div>
              <Settings className="w-4 h-4 text-slate-300 group-hover:text-slate-400 transition-colors flex-shrink-0" />
            </Link>
          );
        })}
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">
        <p className="text-xs text-slate-400 text-center">
          Signed in as <span className="font-semibold text-slate-600">{session?.user?.email}</span>
        </p>
      </div>
    </div>
  );
}
