'use client';

import { useState } from 'react';
import { FileCheck2, Search, Filter, ShieldCheck, User } from 'lucide-react';
import { storeData } from '@/lib/store-data';
import { AuditLog } from '@/types';

export default function AuditLogPage() {
  const [logs] = useState<AuditLog[]>(storeData.getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(l => {
    const q = searchQuery.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.user.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      (l.physicalItemId && l.physicalItemId.toLowerCase().includes(q)) ||
      (l.transactionId && l.transactionId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-emerald-400" />
            Immutable System Audit Log
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative audit trail of all store connections, atomic locks, 99% dropship order creations, and product drafting.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Action, Actor, Details, Item ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Audit Entries: <strong className="text-white">{logs.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3.5 pl-4">Timestamp</th>
                <th className="py-3.5">Actor / System</th>
                <th className="py-3.5">Action Event</th>
                <th className="py-3.5">State Transition</th>
                <th className="py-3.5">Result</th>
                <th className="py-3.5 pr-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 pl-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>

                  <td className="py-4 font-medium text-white flex items-center gap-1.5 whitespace-nowrap">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    {log.user}
                  </td>

                  <td className="py-4 font-mono font-semibold text-indigo-300">
                    {log.action}
                  </td>

                  <td className="py-4 font-mono text-[11px]">
                    {log.previousState && log.newState ? (
                      <span className="text-slate-300">
                        {log.previousState} → <strong className="text-amber-300">{log.newState}</strong>
                      </span>
                    ) : (
                      <span className="text-slate-500">N/A</span>
                    )}
                  </td>

                  <td className="py-4">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      log.result === 'SUCCESS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {log.result}
                    </span>
                  </td>

                  <td className="py-4 pr-4 text-slate-300 max-w-md leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
