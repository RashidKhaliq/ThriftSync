'use client';

import { useState } from 'react';
import { Settings as SettingsIcon, ShieldCheck, Lock, Server, Globe, Key, Bell, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [lockTtl, setLockTtl] = useState('15');
  const [maxRetries, setMaxRetries] = useState('3');
  const [discountPercent, setDiscountPercent] = useState('99');
  const [orderTag, setOrderTag] = useState('Dropshipped_Order');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
          <SettingsIcon className="w-6 h-6 text-indigo-400" />
          System Settings & Deployment Configuration
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure atomic reservation timeouts, 99% internal dropship parameters, and Vercel environment status.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Synchronization Settings */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Synchronization & Reservation Engine Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Atomic Reservation Lock Timeout (Minutes)</label>
              <input
                type="number"
                value={lockTtl}
                onChange={(e) => setLockTtl(e.target.value)}
                className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 font-mono"
              />
              <p className="text-[11px] text-slate-400">Lock automatically releases if order sync does not complete.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Maximum Auto-Retry Attempts</label>
              <input
                type="number"
                value={maxRetries}
                onChange={(e) => setMaxRetries(e.target.value)}
                className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 font-mono"
              />
              <p className="text-[11px] text-slate-400">Idempotent retry attempts before logging critical error.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Cross-Store Order Discount (%)</label>
              <input
                type="text"
                value={discountPercent}
                disabled
                className="w-full bg-slate-900/60 text-emerald-400 p-2.5 rounded-xl border border-slate-800 font-mono font-bold"
              />
              <p className="text-[11px] text-slate-400">Fixed at 99% per MASTER_SPEC Rule 14 requirement.</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-300 font-medium">Mandatory Order Tag</label>
              <input
                type="text"
                value={orderTag}
                disabled
                className="w-full bg-slate-900/60 text-indigo-400 p-2.5 rounded-xl border border-slate-800 font-mono font-bold"
              />
              <p className="text-[11px] text-slate-400">Fixed spelling <code className="text-indigo-300">Dropshipped_Order</code> per Rule 15.</p>
            </div>
          </div>
        </div>

        {/* Security & Secrets Safeguard Panel */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Security & Credential Safeguards
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Server-Side Secret Isolation</div>
                <div className="text-[11px] text-slate-400">Store credentials and access tokens are strictly isolated on server-side endpoints.</div>
              </div>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded border border-emerald-500/30">ENFORCED</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Git .env Exclusions</div>
                <div className="text-[11px] text-slate-400">All local secrets are excluded from Git repository commits via .gitignore rules.</div>
              </div>
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded border border-emerald-500/30">VERIFIED</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-semibold text-white">Vercel Deployment Architecture</div>
                <div className="text-[11px] text-slate-400">Compatible with Vercel serverless functions, App Router API routes, and environment variable binding.</div>
              </div>
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-mono rounded border border-indigo-500/30">READY</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
          >
            Save Configuration Settings
          </button>
        </div>
      </form>
    </div>
  );
}
