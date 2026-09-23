"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle2, AlertCircle, XCircle, Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { getWarranties, addWarranty, deleteWarranty, getWarrantyMetrics } from "@/actions/warranties";
import { getPurchasedProducts } from "@/actions/purchases";

type Warranty = {
  id: string;
  serialNumber: string;
  customerName: string | null;
  expirationDate: Date;
  inventory: { name: string };
};

type Metrics = { activeWarranties: number; expiringSoon: number; expired: number };
type Product = { id: string; name: string; sku: string };

export default function WarrantiesPage() {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ activeWarranties: 0, expiringSoon: 0, expired: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ serialNumber: "", inventoryId: "", customerName: "", expirationDate: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    const [w, m, p] = await Promise.all([getWarranties(), getWarrantyMetrics(), getPurchasedProducts()]);
    setWarranties(w as Warranty[]);
    setMetrics(m);
    setProducts(p as Product[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const getStatus = (expDate: Date) => {
    const now = new Date();
    const exp = new Date(expDate);
    const days = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { label: "Expired", color: "text-red-600 bg-red-50" };
    if (days <= 90) return { label: `Expires in ${days}d`, color: "text-orange-600 bg-orange-50" };
    return { label: "Active", color: "text-emerald-600 bg-emerald-50" };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.inventoryId) { setToast({ message: "Please select a product.", type: "error" }); return; }
    setLoading(true);
    try {
      await addWarranty({ ...form });
      setToast({ message: "Warranty added!", type: "success" });
      setModalOpen(false);
      setForm({ serialNumber: "", inventoryId: "", customerName: "", expirationDate: "" });
      load();
    } catch (err: any) {
      setToast({ message: err?.message ?? "Failed to add warranty", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this warranty record?")) return;
    await deleteWarranty(id);
    setToast({ message: "Warranty deleted.", type: "success" });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-slate-900 mb-1">Warranty Management</h1>
        <p className="text-slate-500 text-[15px]">Track and manage product warranties</p>
      </div>

      <button
        onClick={() => {
          if (products.length === 0) {
            setToast({ message: "No purchased products found. Record a purchase first.", type: "error" });
            return;
          }
          setModalOpen(true);
        }}
        className="w-full bg-primary-600 text-white rounded-xl py-3.5 font-medium hover:bg-primary-700 transition-colors shadow-sm flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" /><span>Add Warranty</span>
      </button>

      {/* Informational banner when no purchased products exist */}
      {products.length === 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">No purchased products yet</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Warranties can only be added for items that have a purchase record.
              Go to{" "}
              <a href="/purchases" className="underline font-medium hover:text-amber-900">Purchase Records</a>{" "}
              to log your first purchase.
            </p>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="space-y-4">
        {[
          { label: "Active Warranties", value: metrics.activeWarranties, sub: "Currently valid", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
          { label: "Expiring Soon", value: metrics.expiringSoon, sub: "Within 90 days", icon: AlertCircle, color: "bg-orange-50 text-orange-500" },
          { label: "Expired", value: metrics.expired, sub: "No longer valid", icon: XCircle, color: "bg-red-50 text-red-500" },
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

      {/* Alert if expiring */}
      {metrics.expiringSoon > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-5 flex items-start space-x-3">
          <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-orange-900 font-semibold mb-1">Warranty Alert</h4>
            <p className="text-orange-800 text-sm leading-relaxed">
              You have {metrics.expiringSoon} warranties expiring soon. Consider reaching out to customers about upcoming expiration dates.
            </p>
          </div>
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-[17px] font-bold text-slate-900 mb-4">Warranty Records</h3>
        {warranties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <CheckCircle2 className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No warranty records yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {warranties.map((w) => {
              const status = getStatus(w.expirationDate);
              return (
                <div key={w.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-slate-900 text-sm">{w.inventory.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">S/N: {w.serialNumber}</p>
                    {w.customerName && <p className="text-xs text-slate-500">Customer: {w.customerName}</p>}
                    <p className="text-xs text-slate-500">Expires: {new Date(w.expirationDate).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete(w.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 ml-3">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Warranty Record">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Product</label>
            <select required value={form.inventoryId} onChange={(e) => setForm((f) => ({ ...f, inventoryId: e.target.value }))}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm">
              <option value="">Select a purchased product...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Only products with a purchase record are listed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
            <input required type="text" placeholder="e.g. SN-2024-00123"
              value={form.serialNumber} onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name (optional)</label>
            <input type="text" placeholder="e.g. Juan dela Cruz"
              value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiration Date</label>
            <input required type="date" value={form.expirationDate} onChange={(e) => setForm((f) => ({ ...f, expirationDate: e.target.value }))}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full mt-2 bg-primary-600 text-white rounded-xl py-3.5 font-medium hover:bg-primary-700 transition-colors disabled:opacity-70">
            {loading ? "Saving..." : "Add Warranty"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
