'use client';

import { useState } from 'react';
import { ShoppingBag, Search, Tag, Percent, ArrowRight, Eye, CheckCircle2, User, ShieldCheck } from 'lucide-react';
import { storeData } from '@/lib/store-data';
import { Order } from '@/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(storeData.getOrders());
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectOrder, setInspectOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(o => {
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.sku.toLowerCase().includes(q) ||
      o.supplier.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.sellingStoreName.toLowerCase().includes(q) ||
      o.originalStoreName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            Cross-Store & Dropship Orders
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracks internal cross-store orders generated with 99% discount, exact tag <code className="text-emerald-400 font-mono">Dropshipped_Order</code>, and transferred customer details.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Order ID, SKU, Supplier, Customer, Store..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
          Total Orders: <strong className="text-white">{orders.length}</strong>
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3.5 pl-4">Order Numbers</th>
                <th className="py-3.5">SKU + Supplier</th>
                <th className="py-3.5">Selling Store</th>
                <th className="py-3.5">Original Owner Store</th>
                <th className="py-3.5">Transferred Customer</th>
                <th className="py-3.5">Discount & Tag</th>
                <th className="py-3.5 pr-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No orders matched your search query.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 pl-4 font-mono">
                      <div className="text-white font-bold">{ord.originalStoreOrderId || ord.id}</div>
                      <div className="text-[10px] text-slate-400">Selling Order: {ord.sellingStoreOrderId}</div>
                    </td>

                    <td className="py-4 font-mono">
                      <div className="text-indigo-300 font-semibold">{ord.sku}</div>
                      <div className="text-[10px] text-amber-300">{ord.supplier}</div>
                    </td>

                    <td className="py-4 font-semibold text-amber-300">
                      {ord.sellingStoreName}
                    </td>

                    <td className="py-4 font-semibold text-indigo-300">
                      {ord.originalStoreName}
                    </td>

                    <td className="py-4">
                      <div className="font-semibold text-white">{ord.customerName}</div>
                      <div className="text-[10px] text-slate-400">{ord.customerEmail}</div>
                    </td>

                    <td className="py-4">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                          <Percent className="w-3 h-3 text-emerald-400" />
                          {ord.discountPercentage}% Discount
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                          <Tag className="w-3 h-3 text-indigo-400" />
                          {ord.orderTag}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 pr-4 text-right">
                      <button
                        onClick={() => setInspectOrder(ord)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="View Full Order Payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Order Modal */}
      {inspectOrder && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-xl p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                Cross-Store Order Full Specifications
              </h2>
              <button onClick={() => setInspectOrder(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Internal Order ID:</span>
                  <span className="text-emerald-400 font-bold">{inspectOrder.id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Original Store Order #:</span>
                  <span className="text-white font-bold">{inspectOrder.originalStoreOrderId}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Selling Store Order #:</span>
                  <span className="text-amber-300 font-bold">{inspectOrder.sellingStoreOrderId}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Exact Mandatory Tag:</span>
                  <span className="text-indigo-300 font-bold">{inspectOrder.orderTag}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Discount Applied:</span>
                  <span className="text-emerald-400 font-bold">{inspectOrder.discountPercentage}% (RULE 14 ENFORCED)</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-slate-400">Recorded 'Sold By':</span>
                  <span className="text-amber-300 font-bold">{inspectOrder.soldBy}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="text-slate-400 font-sans font-bold">Transferred Customer Details:</div>
                <div>Name: <span className="text-white">{inspectOrder.customerName}</span></div>
                <div>Email: <span className="text-white">{inspectOrder.customerEmail}</span></div>
                <div>Address: <span className="text-slate-300">{inspectOrder.shippingAddress}</span></div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
