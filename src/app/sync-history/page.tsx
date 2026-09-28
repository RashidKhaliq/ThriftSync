'use client';

import { useState } from 'react';
import { History, Search, Code, CheckCircle2, AlertOctagon, RefreshCcw } from 'lucide-react';
import { storeData } from '@/lib/store-data';
import { SyncJob } from '@/types';

export default function SyncHistoryPage() {
  const [syncJobs] = useState<SyncJob[]>(storeData.getSyncJobs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<SyncJob | null>(null);

  const filteredJobs = syncJobs.filter(j => {
    const q = searchQuery.toLowerCase();
    return (
      j.transactionId.toLowerCase().includes(q) ||
      j.sku.toLowerCase().includes(q) ||
      j.supplier.toLowerCase().includes(q) ||
      j.operation.toLowerCase().includes(q) ||
      j.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            Synchronization Operations Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete transaction execution logs for inventory updates, reservation locks, dropship orders, and store unpublishing.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Transaction ID, SKU, Operation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Sync Operations: <strong className="text-white">{syncJobs.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3.5 pl-4">Transaction ID</th>
                <th className="py-3.5">Operation</th>
                <th className="py-3.5">SKU + Supplier</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5">Timestamp</th>
                <th className="py-3.5 pr-4 text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredJobs.map((j) => (
                <tr key={j.transactionId} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 pl-4 font-mono font-bold text-indigo-300">
                    {j.transactionId}
                  </td>

                  <td className="py-4 font-semibold text-white">
                    {j.operation}
                  </td>

                  <td className="py-4 font-mono">
                    <div className="text-slate-200">{j.sku}</div>
                    <div className="text-[10px] text-amber-300">{j.supplier}</div>
                  </td>

                  <td className="py-4">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      j.status === 'COMPLETED'
                        ? 'badge-available'
                        : j.status === 'RESERVED'
                        ? 'badge-reserved'
                        : 'badge-failed'
                    }`}>
                      {j.status}
                    </span>
                  </td>

                  <td className="py-4 font-mono text-slate-400">
                    {new Date(j.createdAt).toLocaleTimeString()}
                  </td>

                  <td className="py-4 pr-4 text-right">
                    <button
                      onClick={() => setSelectedJob(j)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Inspect JSON Payload"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Payload Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-xl p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                Transaction {selectedJob.transactionId} Response
              </h2>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-80">
              <pre>{JSON.stringify(JSON.parse(selectedJob.responsePayload || '{}'), null, 2)}</pre>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setSelectedJob(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
