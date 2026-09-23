"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from "lucide-react";
import { getInventoryMetrics } from "@/actions/inventory";
import { getSalesMetrics } from "@/actions/sales";
import { getWarrantyMetrics } from "@/actions/warranties";
import { useSession } from "next-auth/react";

type InventoryMetrics = { totalProducts: number; totalValue: number; lowStockItems: number };
type SalesMetrics = { totalRevenue: number; transactions: number; averageOrder: number; todayRevenue: number };
type WarrantyMetrics = { activeWarranties: number; expiringSoon: number; expired: number };

const REFRESH_INTERVAL_MS = 30_000; // 30 seconds

function SkeletonCard() {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-[14px] bg-slate-100" />
        <div className="w-14 h-5 rounded-full bg-slate-100" />
      </div>
      <div className="w-24 h-7 rounded bg-slate-100 mb-2" />
      <div className="w-36 h-4 rounded bg-slate-100 mb-1" />
      <div className="w-28 h-3 rounded bg-slate-100" />
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [inv, setInv] = useState<InventoryMetrics | null>(null);
  const [sales, setSales] = useState<SalesMetrics | null>(null);
  const [warranties, setWarranties] = useState<WarrantyMetrics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const [i, s, w] = await Promise.all([
        getInventoryMetrics(),
        getSalesMetrics(),
        getWarrantyMetrics(),
      ]);
      setInv(i);
      setSales(s);
      setWarranties(w);
      setLastUpdated(new Date());
    } finally {
      if (showSpinner) setRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Auto-refresh every 30 s
  useEffect(() => {
    const id = setInterval(() => fetchAll(), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchAll]);

  const loading = !inv || !sales || !warranties;
  const firstName = session?.user?.name?.split(" ")[0] ?? "there";

  const cards = loading
    ? null
    : [
        {
          label: "Total Inventory Value",
          value: `₱${inv.totalValue.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          sub: `${inv.totalProducts} product${inv.totalProducts !== 1 ? "s" : ""} in stock`,
          trend:
            inv.lowStockItems > 0
              ? { label: `${inv.lowStockItems} low stock`, up: false }
              : { label: "All stocked", up: true },
          icon: Package,
          iconBg: "bg-blue-50 text-blue-600",
        },
        {
          label: "Total Sales (Last 7 Days)",
          value: `₱${sales.totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
          sub: `${sales.transactions} transaction${sales.transactions !== 1 ? "s" : ""}`,
          trend:
            sales.todayRevenue > 0
              ? { label: `+₱${sales.todayRevenue.toLocaleString()} today`, up: true }
              : { label: "No sales today", up: false },
          icon: DollarSign,
          iconBg: "bg-emerald-50 text-emerald-600",
        },
        {
          label: "Active Warranties",
          value: String(warranties.activeWarranties),
          sub: `${warranties.expired} expired`,
          trend:
            warranties.expiringSoon > 0
              ? { label: `${warranties.expiringSoon} expiring soon`, up: false }
              : { label: "All healthy", up: true },
          icon: ShieldCheck,
          iconBg: "bg-teal-50 text-teal-600",
        },
        {
          label: "Low Stock Alerts",
          value: String(inv.lowStockItems),
          sub: "Items below 5 units",
          trend:
            inv.lowStockItems === 0
              ? { label: "No issues", up: true }
              : { label: "Needs restocking", up: false },
          icon: AlertTriangle,
          iconBg: "bg-orange-50 text-orange-500",
        },
      ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-slate-900 mb-1">Dashboard</h1>
          <p className="text-slate-500 text-[15px]">
            Welcome back, {firstName}! Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>

        {/* Refresh button + last-updated */}
        <div className="flex flex-col items-end gap-1 mt-1">
          <button
            onClick={() => fetchAll(true)}
            disabled={refreshing}
            title="Refresh now"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-primary-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {lastUpdated && (
            <span className="text-[11px] text-slate-400">
              Updated {lastUpdated.toLocaleTimeString("en-PH", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : cards!.map((card) => {
              const Icon = card.icon;
              const TrendIcon = card.trend.up ? ArrowUpRight : ArrowDownRight;
              return (
                <div
                  key={card.label}
                  className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${card.iconBg}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div
                      className={`flex items-center text-sm font-medium space-x-1 ${
                        card.trend.up ? "text-emerald-500" : "text-orange-500"
                      }`}
                    >
                      <TrendIcon className="w-4 h-4" />
                      <span>{card.trend.label}</span>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[26px] font-bold text-slate-900 mb-1">{card.value}</h3>
                    <p className="text-[15px] text-slate-600 font-medium">{card.label}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{card.sub}</p>
                  </div>
                </div>
              );
            })}
      </div>

      {/* Alerts section */}
      {!loading && (inv.lowStockItems > 0 || warranties.expiringSoon > 0) && (
        <div className="space-y-3">
          {inv.lowStockItems > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-orange-900">Low Stock Warning</p>
                <p className="text-xs text-orange-700 mt-0.5">
                  {inv.lowStockItems} item{inv.lowStockItems !== 1 ? "s are" : " is"} below 5 units. Consider restocking soon.
                </p>
              </div>
            </div>
          )}
          {warranties.expiringSoon > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Warranty Alert</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {warranties.expiringSoon} warrant{warranties.expiringSoon !== 1 ? "ies are" : "y is"} expiring within 90 days. Reach out to customers.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick summary strip */}
      {!loading && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-semibold text-slate-900">Quick Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Today&apos;s Revenue</span>
              <span className="font-semibold text-slate-900">
                ₱{sales.todayRevenue.toLocaleString("en-PH", { minimumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Avg Order Value</span>
              <span className="font-semibold text-slate-900">
                ₱{sales.averageOrder.toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Total Products</span>
              <span className="font-semibold text-slate-900">{inv.totalProducts}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Expired Warranties</span>
              <span className={`font-semibold ${warranties.expired > 0 ? "text-red-600" : "text-slate-900"}`}>
                {warranties.expired}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

