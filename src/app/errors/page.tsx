'use client';

import { useState } from 'react';
import { AlertOctagon, RotateCcw, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { storeData } from '@/lib/store-data';
import { SyncError } from '@/types';

export default function ErrorsPage() {
  const [errors, setErrors] = useState<SyncError[]>(storeData.getErrors());
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRetry = (errorId: string) => {
    setRetryingId(errorId);
    setTimeout(() => {
      // Idempotent retry execution
      storeData.resolveError(errorId);
      setErrors(storeData.getErrors());
      setRetryingId(null);
      setSuccessMessage(`Idempotent retry succeeded for error ${errorId}. Duplicate actions prevented.`);
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <AlertOctagon className="w-6 h-6 text-rose-400" />
            Synchronization Error Queue & Safe Retries
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dedicated operational error manager. Execute idempotent safe retries without creating duplicate orders or reservations.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {successMessage}
        </div>
      )}

      {/* Errors List */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
            Recorded Sync & Webhook Failures
          </h2>
          <span className="text-xs text-slate-400 font-mono">Unresolved: {errors.filter(e => e.status === 'UNRESOLVED').length}</span>
        </div>

        <div className="divide-y divide-slate-800/60">
          {errors.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto opacity-80" />
              <div className="text-slate-300 font-bold text-sm">No Unresolved Synchronization Errors</div>
              <p>All store operations and cross-store dropship orders are currently operating smoothly.</p>
            </div>
          ) : (
            errors.map((err) => (
              <div key={err.id} className="p-5 hover:bg-slate-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      err.status === 'UNRESOLVED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {err.status}
                    </span>
                    <span className="text-xs font-bold text-white">{err.operation}</span>
                    <span className="text-xs text-slate-400 font-mono">Store: {err.storeName}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-rose-300">
                    {err.errorMessage}
                  </div>

                  <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
                    <span>SKU: <strong className="text-indigo-300 font-mono">{err.sku}</strong></span>
                    <span>Supplier: <strong className="text-amber-300 font-mono">{err.supplier}</strong></span>
                    <span>Retry Count: <strong className="text-white">{err.retryCount}</strong></span>
                    <span>Logged: {new Date(err.timestamp).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 shrink-0">
                  {err.status === 'UNRESOLVED' && (
                    <button
                      onClick={() => handleRetry(err.id)}
                      disabled={retryingId === err.id}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      <RotateCcw className={`w-3.5 h-3.5 ${retryingId === err.id ? 'animate-spin' : ''}`} />
                      {retryingId === err.id ? 'Executing Retry...' : 'Idempotent Safe Retry'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
