"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, ShoppingCart, TrendingUp, Calendar, Plus, Trash2, X } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Toast from "@/components/ui/Toast";
import { getSales, addSale, getSalesMetrics } from "@/actions/sales";
import { getProducts } from "@/actions/inventory";

type Sale = {
  id: string;
  customerName: string | null;
  totalAmount: number;
  createdAt: Date;
  saleItems: { quantity: number; price: number; inventory: { name: string } }[];
};

type Metrics = { totalRevenue: number; transactions: number; averageOrder: number; todayRevenue: number };
type Product = { id: string; name: string; price: number; stockCount: number };
type CartItem = { inventoryId: string; name: string; quantity: number; price: number };

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ totalRevenue: 0, transactions: 0, averageOrder: 0, todayRevenue: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    const [s, m, p] = await Promise.all([getSales(), getSalesMetrics(), getProducts()]);
    setSales(s as Sale[]);
    setMetrics(m);
    setProducts(p as Product[]);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addToCart = () => {
    const product = products.find((p) => p.id === selectedProduct);
    if (!product) return;
    const existing = cart.find((c) => c.inventoryId === selectedProduct);
    if (existing) {
      setCart((c) => c.map((item) => item.inventoryId === selectedProduct ? { ...item, quantity: item.quantity + qty } : item));
    } else {
      setCart((c) => [...c, { inventoryId: product.id, name: product.name, quantity: qty, price: product.price }]);
    }
    setSelectedProduct("");
    setQty(1);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) { setToast({ message: "Add at least one product to the cart.", type: "error" }); return; }
    setLoading(true);
    try {
      await addSale({ customerName, notes, items: cart });
      setToast({ message: "Sale recorded successfully!", type: "success" });
      setModalOpen(false);
      setCart([]);
      setCustomerName("");
      setNotes("");
      load();
    } catch (err: any) {
      setToast({ message: err?.message ?? "Failed to record sale", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-slate-900 mb-1">Sales Monitoring</h1>
        <p className="text-slate-500 text-[15px]">Track sales performance and revenue trends</p>
      </div>

      <button onClick={() => setModalOpen(true)} className="w-full bg-primary-600 text-white rounded-xl py-3.5 font-medium hover:bg-primary-700 transition-colors shadow-sm flex items-center justify-center space-x-2">
        <Plus className="w-5 h-5" /><span>New Sale</span>
      </button>

      {/* Metrics */}
      <div className="space-y-4">
        {[
          { label: "Total Revenue (7d)", value: `₱${metrics.totalRevenue.toLocaleString()}`, sub: "Last 7 days", icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
          { label: "Transactions", value: metrics.transactions, sub: "Total orders", icon: ShoppingCart, color: "bg-blue-50 text-blue-600" },
          { label: "Average Order", value: `₱${metrics.averageOrder.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, sub: "Per transaction", icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
          { label: "Today's Sales", value: `₱${metrics.todayRevenue.toLocaleString()}`, sub: new Date().toLocaleDateString(), icon: Calendar, color: "bg-orange-50 text-orange-500" },
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

      {/* Sales Log */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="text-[17px] font-bold text-slate-900 mb-4">Sales Log</h3>
        {sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <ShoppingCart className="w-10 h-10 mb-2 opacity-40" />
            <p className="text-sm">No sales recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sales.map((s) => (
              <div key={s.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{s.customerName || "Walk-in Customer"}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.saleItems.map((i) => `${i.inventory.name} x${i.quantity}`).join(", ")}</p>
                    <p className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleString()}</p>
                  </div>
                  <p className="font-bold text-primary-600 text-sm">₱{Number(s.totalAmount).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Sale Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record New Sale">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name (optional)</label>
            <input type="text" placeholder="e.g. Maria Santos" value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary-500 text-sm" />
          </div>

          {/* Product Picker */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-3">Add Products</p>
            <div className="flex gap-2">
              <select value={selectedProduct} onChange={(e) => setSelectedProduct(e.target.value)}
                className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-primary-500 text-sm">
                <option value="">Select product...</option>
                {products.filter((p) => p.stockCount > 0).map((p) => (
                  <option key={p.id} value={p.id}>{p.name} (₱{p.price} · {p.stockCount} left)</option>
                ))}
              </select>
              <input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))}
                className="w-16 px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-sm text-center" />
              <button type="button" onClick={addToCart} disabled={!selectedProduct}
                className="px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-40">
                Add
              </button>
            </div>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.inventoryId} className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.name}</p>
                    <p className="text-xs text-slate-500">₱{item.price} × {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">₱{(item.price * item.quantity).toLocaleString()}</p>
                    <button type="button" onClick={() => setCart((c) => c.filter((i) => i.inventoryId !== item.inventoryId))}
                      className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center px-1 pt-2 border-t border-slate-200">
                <p className="text-sm font-semibold text-slate-700">Total</p>
                <p className="text-lg font-bold text-primary-600">₱{total.toLocaleString()}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea rows={2} placeholder="Any notes..." value={notes} onChange={(e) => setNotes(e.target.value)}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-primary-500 text-sm resize-none" />
          </div>

          <button type="submit" disabled={loading || cart.length === 0}
            className="w-full mt-2 bg-primary-600 text-white rounded-xl py-3.5 font-medium hover:bg-primary-700 disabled:opacity-70">
            {loading ? "Recording..." : `Complete Sale · ₱${total.toLocaleString()}`}
          </button>
        </form>
      </Modal>
    </div>
  );
}
