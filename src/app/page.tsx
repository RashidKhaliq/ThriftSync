'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Store,
  Boxes,
  Lock,
  ShoppingBag,
  AlertTriangle,
  Zap,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { storeData } from '@/lib/store-data';
import { DashboardMetrics } from '@/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(storeData.getMetrics());
  const [physicalItems, setPhysicalItems] = useState(storeData.getPhysicalItems());
  const [orders, setOrders] = useState(storeData.getOrders());
  const [syncJobs, setSyncJobs] = useState(storeData.getSyncJobs());
  const [errors, setErrors] = useState(storeData.getErrors());

  useEffect(() => {
    // Refresh metrics on mount
    setMetrics(storeData.getMetrics());
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-slate-900/90 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Zap className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              Shared Inventory & Multi-Store Dropship Engine
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              ThriftSync Control Center
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Guaranteed single physical thrift item sales across multiple connected store catalogs. Server-side atomic reservation locks, 99% internal dropship orders, and instant store unpublishing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/simulator"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-semibold hover:from-indigo-500 hover:to-indigo-400 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              Launch Webhook Simulator
            </Link>

            <Link
              href="/shared-inventory"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 text-slate-200 text-sm font-medium hover:bg-slate-700/80 border border-slate-700 transition-all"
            >
              <Boxes className="w-4 h-4 text-slate-400" />
              View Inventory
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Operational Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stores */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Connected Stores</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{metrics.connectedStores}</span>
            <span className="text-xs text-slate-400">Total: {metrics.totalStores}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Dynamic store integration</p>
        </div>

        {/* Shared Products */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Shared Products</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{metrics.availableSharedInventory}</span>
            <span className="text-xs text-emerald-400 font-mono">AVAILABLE</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{metrics.sharedProducts} total shared items</p>
        </div>

        {/* Active Reservations */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Reserved Items</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-300">{metrics.reservedInventory}</span>
            <span className="text-xs text-amber-400 font-mono">LOCK ACTIVE</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Atomic reservation locked</p>
        </div>

        {/* Sold Inventory */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Sold Thrift Items</span>
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-white">{metrics.soldInventory}</span>
            <span className="text-xs text-purple-400 font-mono">SYNCED</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{metrics.recentOrdersCount} dropship orders created</p>
        </div>
      </div>

      {/* Critical System Rules Banner */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          Enforced Business Logic Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
              SKU + custom.supplier Matching
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              SKU alone is never used. Identity is resolved via SKU + supplier code + explicit Physical Item ID link.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              99% Internal Dropship Discount
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Orders created on original owner store use a 99% discount and exact tag <code className="bg-slate-800 px-1 py-0.5 rounded text-emerald-400 font-mono">Dropshipped_Order</code>.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Atomic Reservation Lock
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Prevents race conditions when Store B and Store C attempt to buy the same item simultaneously.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Shared Products & Recent Dropship Orders */}
        <div className="lg:col-span-2 space-y-8">
          {/* Shared Inventory Preview */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Boxes className="w-4 h-4 text-emerald-400" />
                  Active Shared Physical Items
                </h2>
                <p className="text-xs text-slate-400">Single-piece thrift items currently shared across stores</p>
              </div>

              <Link
                href="/shared-inventory"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                View all items
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-1">Item Title</th>
                    <th className="pb-3">SKU</th>
                    <th className="pb-3">Supplier</th>
                    <th className="pb-3">Owner Store</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3 pr-1">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {physicalItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pl-1 font-medium text-white flex items-center gap-3">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.title} className="w-8 h-8 rounded-lg object-cover border border-slate-700" />
                        )}
                        <div>
                          <div>{item.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.id}</div>
                        </div>
                      </td>
                      <td className="py-3 font-mono text-indigo-300">{item.sku}</td>
                      <td className="py-3 font-mono text-amber-300">{item.supplier}</td>
                      <td className="py-3 text-slate-300">{item.originalStoreName}</td>
                      <td className="py-3 font-semibold text-white">${item.price.toFixed(2)}</td>
                      <td className="py-3 pr-1">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.status === 'AVAILABLE'
                            ? 'badge-available'
                            : item.status === 'RESERVED'
                            ? 'badge-reserved'
                            : item.status === 'SOLD'
                            ? 'badge-sold'
                            : 'badge-failed'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Synchronized Orders */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-400" />
                  Recent Cross-Store Dropship Orders
                </h2>
                <p className="text-xs text-slate-400">Order transfers with transferred customer email, 99% discount & Dropshipped_Order tag</p>
              </div>

              <Link
                href="/orders"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                View all orders
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {orders.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No cross-store orders executed yet.</p>
              ) : (
                orders.map((ord) => (
                  <div key={ord.id} className="glass-card p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">
                          Order {ord.originalStoreOrderId || ord.id}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                          {ord.discountPercentage}% DISCOUNT APPLIED
                        </span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                          Tag: {ord.orderTag}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Selling Store: <strong className="text-amber-300">{ord.sellingStoreName}</strong></span>
                        <span>•</span>
                        <span>Original Owner: <strong className="text-indigo-300">{ord.originalStoreName}</strong></span>
                        <span>•</span>
                        <span>SKU: <code className="text-indigo-300 font-mono">{ord.sku}</code> ({ord.supplier})</span>
                      </div>

                      <div className="text-[11px] text-slate-400">
                        Transferred Customer: <strong className="text-slate-200">{ord.customerName}</strong> ({ord.customerEmail})
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end justify-center">
                      <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        SYNC COMPLETED
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {new Date(ord.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Actions & Sync Log Feed */}
        <div className="space-y-6">
          {/* Quick Actions Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Quick Actions
            </h3>

            <div className="space-y-2.5">
              <Link
                href="/simulator"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-900/60 to-slate-900 border border-indigo-500/30 hover:border-indigo-500/60 text-slate-200 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-amber-300" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold">Test Cross-Store Sale</div>
                    <div className="text-[10px] text-slate-400">Simulate Store B selling Store A item</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
              </Link>

              <Link
                href="/stores"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold">Connect New Store</div>
                    <div className="text-[10px] text-slate-400">Add dynamic thrift store catalog</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors" />
              </Link>

              <Link
                href="/errors"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold">Review Error Queue</div>
                    <div className="text-[10px] text-slate-400">Idempotent retry for failed syncs</div>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Sync History Live Activity Feed */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
                Sync Engine Feed
              </h3>
              <Link href="/sync-history" className="text-xs text-indigo-400 hover:text-indigo-300">
                Full Log
              </Link>
            </div>

            <div className="space-y-3">
              {syncJobs.slice(0, 4).map((job) => (
                <div key={job.transactionId} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                    <span className="text-indigo-300">{job.transactionId}</span>
                    <span className="text-emerald-400 font-bold">{job.status}</span>
                  </div>
                  <div className="text-slate-200 font-semibold">{job.operation}</div>
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>SKU: {job.sku} ({job.supplier})</span>
                    <span>{new Date(job.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
