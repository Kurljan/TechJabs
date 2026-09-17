"use client";

import { useState, useEffect, useCallback } from "react";
import { Receipt, FileText, Download, Eye } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { getSales } from "@/actions/sales";

type Sale = {
  id: string;
  customerName: string | null;
  totalAmount: number;
  notes: string | null;
  createdAt: Date;
  saleItems: { quantity: number; price: number; inventory: { name: string } }[];
};

export default function ReceiptsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [viewSale, setViewSale] = useState<Sale | null>(null);

  const load = useCallback(async () => {
    const s = await getSales();
    setSales(s as Sale[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const todayCount = sales.filter((s) => {
    const today = new Date();
    const d = new Date(s.createdAt);
    return d.toDateString() === today.toDateString();
  }).length;

  const weekCount = sales.filter((s) => {
    const d = new Date(s.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-slate-900 mb-1">Digital Receipts</h1>
        <p className="text-slate-500 text-[15px]">View and print sale receipts</p>
      </div>

      {/* Metric Cards */}
      <div className="space-y-4">
        {[
          { label: "Total Receipts", value: sales.length, sub: "All time", icon: Receipt, color: "bg-blue-50 text-blue-600" },
          { label: "This Week", value: weekCount, sub: "Generated receipts", icon: FileText, color: "bg-emerald-50 text-emerald-600" },
          { label: "Today", value: todayCount, sub: "New receipts", icon: Download, color: "bg-purple-50 text-purple-600" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500 mb-1">{label}</p>
              <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
              <p className="text-xs text-slate-400 mt-1">{sub}</p>
            </div>
            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center ${color}`}><Icon className="w-6 h-6" /></div>
          </div>
        ))}
      </div>

      {/* Receipt Records */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-[17px] font-bold text-slate-900 mb-4">Receipt Records</h3>
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <Receipt className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No receipts yet. Record a sale to generate one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sales.map((s, idx) => (
              <div key={s.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">Receipt #{sales.length - idx}</p>
                  <p className="text-xs text-slate-500">{s.customerName || "Walk-in Customer"}</p>
                  <p className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <p className="font-bold text-primary-600 text-sm">₱{Number(s.totalAmount).toLocaleString()}</p>
                  <button onClick={() => setViewSale(s)} className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Receipt Modal */}
      <Modal isOpen={!!viewSale} onClose={() => setViewSale(null)} title="Receipt">
        {viewSale && (
          <div className="space-y-4">
            {/* Header */}
            <div className="text-center pb-4 border-b border-slate-200">
              <p className="text-lg font-bold text-slate-900">TechSolve Store</p>
              <p className="text-xs text-slate-500">Official Receipt</p>
              <p className="text-xs text-slate-400 mt-1">{new Date(viewSale.createdAt).toLocaleString()}</p>
            </div>

            <div>
              <p className="text-sm text-slate-500">Customer</p>
              <p className="text-sm font-semibold text-slate-900">{viewSale.customerName || "Walk-in Customer"}</p>
            </div>

            {/* Items */}
            <div className="space-y-2">
              {viewSale.saleItems.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <div>
                    <p className="text-slate-800">{item.inventory.name}</p>
                    <p className="text-xs text-slate-400">₱{item.price.toLocaleString()} × {item.quantity}</p>
                  </div>
                  <p className="font-medium text-slate-800">₱{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-3">
              <p className="font-bold text-slate-900">TOTAL</p>
              <p className="text-xl font-bold text-primary-600">₱{Number(viewSale.totalAmount).toLocaleString()}</p>
            </div>

            {viewSale.notes && (
              <p className="text-xs text-slate-400 text-center">{viewSale.notes}</p>
            )}

            <button onClick={() => window.print()}
              className="w-full bg-primary-600 text-white rounded-xl py-3 font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
              <Download className="w-4 h-4" /> Print Receipt
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
