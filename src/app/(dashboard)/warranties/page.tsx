"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Trash2,
  ShoppingBag,
  TrendingUp,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { getWarranties, addWarranty, deleteWarranty, getWarrantyMetrics } from "@/actions/warranties";
import { getPurchaseProducts, getSaleProducts } from "@/actions/purchases";

type WarrantyType = "PURCHASE" | "SALE";

type Warranty = {
  id: string;
  serialNumber: string;
  warrantyType: string;
  customerName: string | null;
  supplierName: string | null;
  expirationDate: Date;
  inventory: { name: string };
};

type Metrics = { activeWarranties: number; expiringSoon: number; expired: number };
type PurchaseProduct = { id: string; name: string; sku: string };
type SaleProduct = {
  id: string; // saleItem.id
  inventory: { id: string; name: string; sku: string };
  sale: { customerName: string | null; createdAt: string };
};

const EMPTY_FORM = {
  serialNumber: "",
  inventoryId: "",
  customerName: "",
  supplierName: "",
  expirationDate: "",
  selectedSaleItemId: "",
};

export default function WarrantiesPage() {
  const [activeTab, setActiveTab] = useState<WarrantyType>("PURCHASE");

  const [purchaseWarranties, setPurchaseWarranties] = useState<Warranty[]>([]);
  const [saleWarranties, setSaleWarranties] = useState<Warranty[]>([]);
  const [purchaseMetrics, setPurchaseMetrics] = useState<Metrics>({ activeWarranties: 0, expiringSoon: 0, expired: 0 });
  const [saleMetrics, setSaleMetrics] = useState<Metrics>({ activeWarranties: 0, expiringSoon: 0, expired: 0 });
  const [purchaseProducts, setPurchaseProducts] = useState<PurchaseProduct[]>([]);
  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    const [pw, sw, pm, sm, pp, sp] = await Promise.all([
      getWarranties("PURCHASE"),
      getWarranties("SALE"),
      getWarrantyMetrics("PURCHASE"),
      getWarrantyMetrics("SALE"),
      getPurchaseProducts(),
      getSaleProducts(),
    ]);
    setPurchaseWarranties(pw as Warranty[]);
    setSaleWarranties(sw as Warranty[]);
    setPurchaseMetrics(pm);
    setSaleMetrics(sm);
    setPurchaseProducts(pp as PurchaseProduct[]);
    setSaleProducts(sp as SaleProduct[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const isPurchase = activeTab === "PURCHASE";
  const warranties = isPurchase ? purchaseWarranties : saleWarranties;
  const metrics = isPurchase ? purchaseMetrics : saleMetrics;
  const hasSaleProducts = saleProducts.length > 0;
  const hasPurchaseProducts = purchaseProducts.length > 0;
  const hasProducts = isPurchase ? hasPurchaseProducts : hasSaleProducts;

  const getStatus = (expDate: Date) => {
    const days = Math.ceil((new Date(expDate).getTime() - Date.now()) / 86400000);
    if (days < 0) return { label: "Expired", color: "text-red-600 bg-red-50" };
    if (days <= 90) return { label: `Expires in ${days}d`, color: "text-orange-600 bg-orange-50" };
    return { label: "Active", color: "text-emerald-600 bg-emerald-50" };
  };

  const openModal = () => {
    if (!hasProducts) {
      const msg = isPurchase
        ? "No purchased products found. Add a Purchase Record first."
        : "No sold products found. Record a Sale first.";
      setToast({ message: msg, type: "error" });
      return;
    }
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const handleSaleProductSelect = (saleItemId: string) => {
    const item = saleProducts.find((p) => p.id === saleItemId);
    if (item) {
      setForm((f) => ({
        ...f,
        selectedSaleItemId: item.id,
        inventoryId: item.inventory.id,
        customerName: item.sale.customerName ?? "",
      }));
    } else {
      setForm((f) => ({ ...f, selectedSaleItemId: "", inventoryId: "", customerName: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.inventoryId) {
      setToast({ message: "Please select a product.", type: "error" });
      return;
    }
    setSubmitting(true);
    try {
      // Strip UI-only field before sending to server action
      const { selectedSaleItemId, ...warrantyData } = form;
      const result = await addWarranty({ ...warrantyData, warrantyType: activeTab });
      if (result?.error) {
        setToast({ message: result.error, type: "error" });
      } else {
        setToast({ message: `${isPurchase ? "Purchase" : "Sales"} warranty added!`, type: "success" });
        setModalOpen(false);
        load();
      }
    } catch (err: any) {
      setToast({ message: err?.message ?? "Failed to add warranty", type: "error" });
    } finally {
      setSubmitting(false);
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

      <div className="mb-2">
        <h1 className="text-[28px] font-bold text-slate-900 mb-1">Warranty Management</h1>
        <p className="text-slate-500 text-[15px]">Track store purchase and customer sales warranties separately.</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
        {(["PURCHASE", "SALE"] as WarrantyType[]).map((tab) => {
          const active = activeTab === tab;
          const Icon = tab === "PURCHASE" ? ShoppingBag : TrendingUp;
          const label = tab === "PURCHASE" ? "Store Purchase Warranty" : "Store Sales Warranty";
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all ${
                active
                  ? "bg-white shadow-sm text-primary-700"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{tab === "PURCHASE" ? "Purchase" : "Sales"}</span>
            </button>
          );
        })}
      </div>

      {/* Tab description */}
      <div className={`rounded-2xl p-4 border text-sm flex items-start gap-3 ${
        isPurchase
          ? "bg-blue-50 border-blue-100 text-blue-800"
          : "bg-emerald-50 border-emerald-100 text-emerald-800"
      }`}>
        {isPurchase
          ? <ShoppingBag className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-500" />
          : <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-500" />}
        <div>
          <p className="font-semibold mb-0.5">
            {isPurchase ? "Store Purchase Warranty" : "Store Sales Warranty"}
          </p>
          <p className="text-xs opacity-80">
            {isPurchase
              ? "Warranties received from suppliers when the store purchases stock. Records the supplier and protects the store."
              : "Warranties issued to customers when the store sells a product. Select the sale record — the customer name fills in automatically."}
          </p>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={openModal}
        className={`w-full text-white rounded-xl py-3.5 font-medium transition-colors shadow-sm flex items-center justify-center gap-2 ${
          isPurchase ? "bg-primary-600 hover:bg-primary-700" : "bg-emerald-600 hover:bg-emerald-700"
        }`}
      >
        <Plus className="w-5 h-5" />
        <span>Add {isPurchase ? "Purchase" : "Sales"} Warranty</span>
      </button>

      {/* No products banner */}
      {!hasProducts && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              {isPurchase ? "No purchased products yet" : "No sold products yet"}
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              {isPurchase
                ? <><a href="/purchases" className="underline font-medium">Add a Purchase Record</a> first to register a supplier warranty.</>
                : <><a href="/sales" className="underline font-medium">Record a Sale</a> first to issue a customer warranty.</>}
            </p>
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Active", value: metrics.activeWarranties, sub: "Valid", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
          { label: "Expiring Soon", value: metrics.expiringSoon, sub: "≤90 days", icon: AlertCircle, color: "bg-orange-50 text-orange-500" },
          { label: "Expired", value: metrics.expired, sub: "Invalid", icon: XCircle, color: "bg-red-50 text-red-500" },
        ].map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-2">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{value}</h3>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-[10px] text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Expiry Alert */}
      {metrics.expiringSoon > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-orange-800">
            <span className="font-semibold">{metrics.expiringSoon} {isPurchase ? "supplier" : "customer"} warrant{metrics.expiringSoon !== 1 ? "ies are" : "y is"} expiring</span> within 90 days.
            {!isPurchase && " Consider reaching out to customers."}
          </p>
        </div>
      )}

      {/* Records */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-[17px] font-bold text-slate-900 mb-4">
          {isPurchase ? "Purchase" : "Sales"} Warranty Records
          {warranties.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-400">({warranties.length})</span>
          )}
        </h3>
        {warranties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <CheckCircle2 className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No {isPurchase ? "purchase" : "sales"} warranty records yet.</p>
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
                    {w.supplierName && <p className="text-xs text-slate-500">Supplier: {w.supplierName}</p>}
                    {w.customerName && <p className="text-xs text-slate-500">Customer: {w.customerName}</p>}
                    <p className="text-xs text-slate-500">Expires: {new Date(w.expirationDate).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete(w.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 ml-3 flex-shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isPurchase ? "Add Purchase Warranty" : "Add Sales Warranty"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type badge */}
          <div className={`rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
            isPurchase ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"
          }`}>
            {isPurchase ? <ShoppingBag className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
            {isPurchase ? "Store Purchase Warranty — from supplier to store" : "Store Sales Warranty — from store to customer"}
          </div>

          {/* Product selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isPurchase ? "Purchased Product" : "Sold Product / Sale Record"}
            </label>

            {isPurchase ? (
              /* Purchase tab — simple inventory picker */
              <select
                required
                value={form.inventoryId}
                onChange={(e) => setForm((f) => ({ ...f, inventoryId: e.target.value }))}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="">Select a purchased product...</option>
                {purchaseProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.sku}
                  </option>
                ))}
              </select>
            ) : (
              /* Sales tab — saleItem picker, customer auto-fills */
              <>
                <select
                  required
                  value={form.selectedSaleItemId}
                  onChange={(e) => handleSaleProductSelect(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-sm"
                >
                  <option value="">Select a sold product...</option>
                  {saleProducts.map((p) => {
                    const customer = p.sale.customerName ? p.sale.customerName : "Unknown Customer";
                    const date = new Date(p.sale.createdAt).toLocaleDateString();
                    return (
                      <option key={p.id} value={p.id}>
                        {p.inventory.name} ({p.inventory.sku}) — {customer} on {date}
                      </option>
                    );
                  })}
                </select>
                {form.customerName && (
                  <p className="mt-1.5 text-xs text-emerald-700 font-medium">
                    ✓ Customer auto-filled: <span className="font-bold">{form.customerName}</span>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Serial Number */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Serial Number</label>
            <input
              required
              type="text"
              placeholder="e.g. SN-2024-00123"
              value={form.serialNumber}
              onChange={(e) => setForm((f) => ({ ...f, serialNumber: e.target.value }))}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          {/* Supplier Name (Purchase only) */}
          {isPurchase && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name (optional)</label>
              <input
                type="text"
                placeholder="e.g. PC Parts Hub"
                value={form.supplierName}
                onChange={(e) => setForm((f) => ({ ...f, supplierName: e.target.value }))}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          )}

          {/* Customer Name (Sale only) — editable but pre-filled from sale */}
          {!isPurchase && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Customer Name
                <span className="ml-1 text-xs font-normal text-slate-400">(auto-filled from sale)</span>
              </label>
              <input
                type="text"
                placeholder="Select a sale above to auto-fill"
                value={form.customerName}
                onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 text-sm"
              />
            </div>
          )}

          {/* Expiration Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Expiration Date</label>
            <input
              required
              type="date"
              value={form.expirationDate}
              onChange={(e) => setForm((f) => ({ ...f, expirationDate: e.target.value }))}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full mt-2 text-white rounded-xl py-3.5 font-medium transition-colors disabled:opacity-70 ${
              isPurchase ? "bg-primary-600 hover:bg-primary-700" : "bg-emerald-600 hover:bg-emerald-700"
            }`}
          >
            {submitting ? "Saving..." : `Add ${isPurchase ? "Purchase" : "Sales"} Warranty`}
          </button>
        </form>
      </Modal>
    </div>
  );
}
