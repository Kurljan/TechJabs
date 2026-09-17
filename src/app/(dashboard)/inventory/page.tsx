"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, CheckCircle2, AlertTriangle, Plus, Search, Pencil, Trash2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getInventoryMetrics,
} from "@/actions/inventory";

type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  stockCount: number;
  price: number;
};

type Metrics = { totalProducts: number; totalValue: number; lowStockItems: number };

const CATEGORIES = ["Laptops", "Desktops", "Components", "Peripherals", "Networking", "Storage", "Software", "Other"];

const emptyForm = { name: "", sku: "", category: "Laptops", stockCount: 0, price: 0 };

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ totalProducts: 0, totalValue: 0, lowStockItems: 0 });
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    const [p, m] = await Promise.all([getProducts(search), getInventoryMetrics()]);
    setProducts(p as Product[]);
    setMetrics(m);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setEditTarget(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (p: Product) => { setEditTarget(p); setForm({ name: p.name, sku: p.sku, category: p.category, stockCount: p.stockCount, price: p.price }); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editTarget) {
        await updateProduct(editTarget.id, { ...form, stockCount: Number(form.stockCount), price: Number(form.price) });
        setToast({ message: "Product updated successfully!", type: "success" });
      } else {
        await addProduct({ ...form, stockCount: Number(form.stockCount), price: Number(form.price) });
        setToast({ message: "Product added successfully!", type: "success" });
      }
      setModalOpen(false);
      load();
    } catch (err: any) {
      setToast({ message: err?.message ?? "Something went wrong", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(id);
      setToast({ message: "Product deleted.", type: "success" });
      load();
    } catch {
      setToast({ message: "Failed to delete product.", type: "error" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-slate-900 mb-1">Inventory Management</h1>
        <p className="text-slate-500 text-[15px]">Track and manage your product inventory</p>
      </div>

      <button onClick={openAdd} className="w-full bg-primary-600 text-white rounded-xl py-3.5 font-medium hover:bg-primary-700 transition-colors shadow-sm flex items-center justify-center space-x-2">
        <Plus className="w-5 h-5" />
        <span>Add Product</span>
      </button>

      {/* Metrics */}
      <div className="space-y-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Products</p>
            <h3 className="text-2xl font-bold text-slate-900">{metrics.totalProducts}</h3>
            <p className="text-xs text-slate-400 mt-1">{products.reduce((s, p) => s + p.stockCount, 0)} units in stock</p>
          </div>
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-blue-50 text-blue-600"><Package className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 mb-1">Total Value</p>
            <h3 className="text-2xl font-bold text-slate-900">₱{metrics.totalValue.toLocaleString()}</h3>
            <p className="text-xs text-slate-400 mt-1">Inventory worth</p>
          </div>
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-6 h-6" /></div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500 mb-1">Low Stock Items</p>
            <h3 className="text-2xl font-bold text-slate-900">{metrics.lowStockItems}</h3>
            <p className="text-xs text-slate-400 mt-1">Needs restocking</p>
          </div>
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-orange-50 text-orange-500"><AlertTriangle className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-[17px] font-bold text-slate-900 mb-4">Product List</h3>
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, or category..."
            className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-slate-900 text-sm"
          />
        </div>

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <Package className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No products found. Add your first product!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-4 rounded-xl border ${
                  p.stockCount < 5 ? "border-orange-200 bg-orange-50" : "border-slate-100 bg-slate-50"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-slate-900 text-sm truncate">{p.name}</p>
                    {p.stockCount < 5 && (
                      <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded-full">LOW STOCK</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">SKU: {p.sku} · {p.category}</p>
                  <p className="text-xs text-slate-500">Stock: {p.stockCount} · ₱{p.price.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id, p.name)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? "Edit Product" : "Add New Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Product Name", key: "name", type: "text", placeholder: "e.g. Ryzen 5 5600X" },
            { label: "SKU", key: "sku", type: "text", placeholder: "e.g. CPU-AMD-5600X" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
              <input
                type={type}
                required
                placeholder={placeholder}
                value={(form as any)[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Count</label>
              <input
                type="number" min={0} required
                value={form.stockCount}
                onChange={(e) => setForm((f) => ({ ...f, stockCount: Number(e.target.value) }))}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Price (₱)</label>
              <input
                type="number" min={0} step="0.01" required
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full mt-2 bg-primary-600 text-white rounded-xl py-3.5 font-medium hover:bg-primary-700 transition-colors disabled:opacity-70"
          >
            {loading ? "Saving..." : editTarget ? "Update Product" : "Add Product"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
