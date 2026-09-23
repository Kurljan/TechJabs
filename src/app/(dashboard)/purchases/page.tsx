"use client";

import { useState, useEffect, useCallback } from "react";
import { ShoppingBag, Plus, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { getPurchases, addPurchase, deletePurchase } from "@/actions/purchases";
import { getProducts } from "@/actions/inventory";

type Purchase = {
  id: string;
  supplier: string;
  quantity: number;
  unitCost: number;
  notes: string | null;
  createdAt: Date;
  inventory: { name: string };
};

type Product = { id: string; name: string };

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [form, setForm] = useState({ 
    supplier: "", 
    inventoryId: "", 
    quantity: 1, 
    unitCost: 0, 
    notes: "",
    newProductName: "",
    newProductSku: "",
    newProductCategory: "",
    newProductPrice: 0,
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    const [p, prods] = await Promise.all([getPurchases(), getProducts()]);
    setPurchases(p as Purchase[]);
    setProducts((prods as any[]).map((p: any) => ({ id: p.id, name: p.name })));
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalSpent = purchases.reduce((sum, p) => sum + p.unitCost * p.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isNewProduct && !form.inventoryId) { setToast({ message: "Please select a product.", type: "error" }); return; }
    if (isNewProduct && (!form.newProductName || !form.newProductSku || !form.newProductCategory || form.newProductPrice < 0)) {
      setToast({ message: "Please fill out all new product details.", type: "error" }); return;
    }
    
    setLoading(true);
    try {
      const payload = {
        supplier: form.supplier,
        quantity: Number(form.quantity),
        unitCost: Number(form.unitCost),
        notes: form.notes,
        ...(isNewProduct 
          ? { newProduct: { name: form.newProductName, sku: form.newProductSku, category: form.newProductCategory, price: Number(form.newProductPrice) } }
          : { inventoryId: form.inventoryId })
      };
      
      const res = await addPurchase(payload);
      if (res?.error) {
        setToast({ message: res.error, type: "error" });
        return;
      }
      
      setToast({ message: "Purchase recorded! Stock updated.", type: "success" });
      setModalOpen(false);
      setForm({ supplier: "", inventoryId: "", quantity: 1, unitCost: 0, notes: "", newProductName: "", newProductSku: "", newProductCategory: "", newProductPrice: 0 });
      setIsNewProduct(false);
      load();
    } catch (err: any) {
      setToast({ message: err?.message ?? "Failed to record purchase", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this purchase record?")) return;
    await deletePurchase(id);
    setToast({ message: "Purchase record deleted.", type: "success" });
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-slate-900 mb-1">Purchase Records</h1>
        <p className="text-slate-500 text-[15px]">Log stock received from suppliers</p>
      </div>

      <button onClick={() => setModalOpen(true)} className="w-full bg-primary-600 text-white rounded-xl py-3.5 font-medium hover:bg-primary-700 transition-colors shadow-sm flex items-center justify-center space-x-2">
        <Plus className="w-5 h-5" /><span>Add Purchase Record</span>
      </button>

      {/* Summary Cards */}
      <div className="space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Purchases</p>
            <h3 className="text-2xl font-bold text-slate-900">{purchases.length}</h3>
            <p className="text-xs text-slate-400 mt-1">All time records</p>
          </div>
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-blue-50 text-blue-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Spent</p>
            <h3 className="text-2xl font-bold text-slate-900">₱{totalSpent.toLocaleString()}</h3>
            <p className="text-xs text-slate-400 mt-1">Cost of goods purchased</p>
          </div>
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-emerald-50 text-emerald-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Purchase Log */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-[17px] font-bold text-slate-900 mb-4">Purchase History</h3>
        {purchases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <ShoppingBag className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No purchases recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {purchases.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{p.inventory.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">Supplier: {p.supplier} · Qty: {p.quantity}</p>
                  {p.notes && <p className="text-xs text-slate-400">{p.notes}</p>}
                  <p className="text-xs text-slate-400">{new Date(p.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 ml-3">
                  <p className="font-bold text-slate-700 text-sm">₱{(p.unitCost * p.quantity).toLocaleString()}</p>
                  <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Purchase Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Purchase Record">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
            <input required type="text" placeholder="e.g. PC Parts Hub" value={form.supplier} onChange={(e) => setForm((f) => ({ ...f, supplier: e.target.value }))}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-slate-700">Product</label>
              <button 
                type="button"
                onClick={() => setIsNewProduct(!isNewProduct)}
                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
              >
                {isNewProduct ? "Select Existing Product" : "+ Add New Product"}
              </button>
            </div>
            
            {!isNewProduct ? (
              <select required={!isNewProduct} value={form.inventoryId} onChange={(e) => setForm((f) => ({ ...f, inventoryId: e.target.value }))}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 text-sm">
                <option value="">Select a product...</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Product Name</label>
                  <input required={isNewProduct} type="text" placeholder="e.g. RTX 4090" value={form.newProductName} onChange={(e) => setForm((f) => ({ ...f, newProductName: e.target.value }))}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">SKU</label>
                    <input required={isNewProduct} type="text" placeholder="e.g. GPU-4090-001" value={form.newProductSku} onChange={(e) => setForm((f) => ({ ...f, newProductSku: e.target.value }))}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Category</label>
                    <input required={isNewProduct} type="text" placeholder="e.g. Components" value={form.newProductCategory} onChange={(e) => setForm((f) => ({ ...f, newProductCategory: e.target.value }))}
                      className="block w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 mb-1">Retail Selling Price (₱)</label>
                  <input required={isNewProduct} type="number" min={0} step="0.01" value={form.newProductPrice} onChange={(e) => setForm((f) => ({ ...f, newProductPrice: Number(e.target.value) }))}
                    className="block w-full px-3 py-2 border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 text-sm" />
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Received</label>
              <input required type="number" min={1} value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary-500 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Unit Cost (₱)</label>
              <input required type="number" min={0} step="0.01" value={form.unitCost} onChange={(e) => setForm((f) => ({ ...f, unitCost: Number(e.target.value) }))}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea rows={2} placeholder="e.g. Batch #3, 30-day return policy" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary-500 text-sm resize-none" />
          </div>
          {form.quantity > 0 && form.unitCost > 0 && (
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xs text-blue-600 font-medium">Total Cost: ₱{(form.quantity * form.unitCost).toLocaleString()}</p>
              <p className="text-xs text-blue-500">Stock will increase by {form.quantity} units</p>
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full mt-2 bg-primary-600 text-white rounded-xl py-3.5 font-medium hover:bg-primary-700 disabled:opacity-70">
            {loading ? "Saving..." : "Record Purchase"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
