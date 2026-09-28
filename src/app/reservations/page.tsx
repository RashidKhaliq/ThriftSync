'use client';

import { useState } from 'react';
import { Lock, Clock, ShieldAlert, CheckCircle2, RotateCcw, AlertTriangle, User, RefreshCw } from 'lucide-react';
import { storeData } from '@/lib/store-data';
import { Reservation } from '@/types';

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(storeData.getReservations());

  const handleRelease = (reservationId: string) => {
    if (confirm('Are you sure you want to release this reservation lock? The item will be made AVAILABLE again.')) {
      storeData.releaseReservation(reservationId, 'Manual admin release from Reservations page');
      setReservations(storeData.getReservations());
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-amber-400" />
            Atomic Reservation Locking System
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Server-side atomic lock registry. Prevents race conditions before final cross-store order synchronization.
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="glass-panel p-5 rounded-2xl border border-amber-500/20 bg-amber-950/10 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <h3 className="font-bold text-amber-300">Server-Side Atomic Locking Guarantee</h3>
          <p className="text-slate-300 leading-relaxed">
            When a store receives a sale event, an atomic lock key <code className="bg-slate-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">lock:phy:[PhysicalItemId]</code> is acquired server-side. Concurrent purchase attempts from other stores are rejected immediately.
          </p>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
            Reservation Locks History & State
          </h2>
          <span className="text-xs text-slate-400 font-mono">Total: {reservations.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3.5 pl-4">Reservation ID</th>
                <th className="py-3.5">SKU + Supplier</th>
                <th className="py-3.5">Selling Store</th>
                <th className="py-3.5">Original Owner</th>
                <th className="py-3.5">Customer</th>
                <th className="py-3.5">Locked At</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No active or historical reservations. Run a simulated sale on the <strong className="text-indigo-400">Simulator</strong> page to create one!
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 pl-4 font-mono font-bold text-amber-300">
                      {res.id}
                    </td>

                    <td className="py-4">
                      <div className="font-mono text-indigo-300 font-semibold">{res.sku}</div>
                      <div className="text-[10px] text-amber-300 font-mono">{res.supplier}</div>
                    </td>

                    <td className="py-4 font-semibold text-slate-200">{res.sellingStoreName}</td>
                    <td className="py-4 font-semibold text-slate-300">{res.originalStoreName}</td>

                    <td className="py-4">
                      <div className="font-semibold text-white">{res.customerName}</div>
                      <div className="text-[10px] text-slate-400">{res.customerEmail}</div>
                    </td>

                    <td className="py-4 font-mono text-slate-400">
                      {new Date(res.lockedAt).toLocaleTimeString()}
                    </td>

                    <td className="py-4">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        res.status === 'ACTIVE'
                          ? 'badge-reserved'
                          : res.status === 'COMPLETED'
                          ? 'badge-sold'
                          : 'badge-failed'
                      }`}>
                        {res.status}
                      </span>
                    </td>

                    <td className="py-4 pr-4 text-right">
                      {res.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRelease(res.id)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold transition-all"
                        >
                          Release Lock
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
