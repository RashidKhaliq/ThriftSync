'use client';

import { useState, useEffect } from 'react';
import { Store as StoreIcon, Plus, Trash2, Edit2, CheckCircle2, AlertCircle, RefreshCw, Key, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { storeData } from '@/lib/store-data';
import { Store } from '@/types';

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>(storeData.getStores());
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newSupplierCode, setNewSupplierCode] = useState('');

  useEffect(() => {
    setStores(storeData.getStores());
  }, []);

  const handleAddStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoreName || !newDomain || !newSupplierCode) return;

    storeData.addStore({
      name: newStoreName,
      domain: newDomain.includes('.myshopify.com') ? newDomain : `${newDomain}.myshopify.com`,
      supplierCode: newSupplierCode.startsWith('Store_') ? newSupplierCode : `Store_${newSupplierCode}`,
      status: 'CONNECTED',
      apiKey: `shpat_${Math.random().toString(36).substring(2, 12)}`,
      webhookSecret: `whsec_${Math.random().toString(36).substring(2, 16)}`
    });

    setStores(storeData.getStores());
    setShowAddModal(false);
    setNewStoreName('');
    setNewDomain('');
    setNewSupplierCode('');
  };

  const handleDisconnect = (storeId: string) => {
    if (confirm('Are you sure you want to disconnect this store? Shared items linked to this store will be affected.')) {
      storeData.deleteStore(storeId);
      setStores(storeData.getStores());
    }
  };

  const handleToggleStatus = (storeId: string, currentStatus: Store['status']) => {
    const nextStatus = currentStatus === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
    storeData.updateStoreStatus(storeId, nextStatus);
    setStores(storeData.getStores());
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <StoreIcon className="w-6 h-6 text-indigo-400" />
            Store Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dynamic store integration engine. Add, connect, or manage thrift stores with custom supplier codes.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Connect New Store
        </button>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stores.map((st) => (
          <div key={st.id} className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                    <StoreIcon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{st.name}</h3>
                    <span className="text-[11px] font-mono text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Supplier: {st.supplierCode}
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  st.status === 'CONNECTED'
                    ? 'badge-available'
                    : 'badge-failed'
                }`}>
                  {st.status}
                </span>
              </div>

              <div className="text-xs text-slate-300 font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="truncate">{st.domain}</span>
                <LinkIcon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2">
                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-slate-400 text-[10px] uppercase">Products</div>
                  <div className="text-lg font-bold text-white mt-0.5">{st.productCount}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                  <div className="text-slate-400 text-[10px] uppercase">Orders</div>
                  <div className="text-lg font-bold text-white mt-0.5">{st.orderCount}</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Last synced: {new Date(st.lastSyncAt).toLocaleTimeString()}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleStatus(st.id, st.status)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                >
                  {st.status === 'CONNECTED' ? 'Pause Sync' : 'Resume'}
                </button>

                <button
                  onClick={() => handleDisconnect(st.id)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                  title="Disconnect Store"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connect Store Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <StoreIcon className="w-5 h-5 text-indigo-400" />
                Connect New Thrift Store
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddStore} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Store Display Name</label>
                <input
                  type="text"
                  placeholder="e.g. Store E (Thrift Haven)"
                  value={newStoreName}
                  onChange={(e) => setNewStoreName(e.target.value)}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Shopify Store Domain</label>
                <input
                  type="text"
                  placeholder="e.g. store-e-haven.myshopify.com"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Supplier Code (custom.supplier)</label>
                <input
                  type="text"
                  placeholder="e.g. Store_E"
                  value={newSupplierCode}
                  onChange={(e) => setNewSupplierCode(e.target.value)}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none font-mono"
                  required
                />
                <p className="text-[11px] text-slate-400">
                  Used as Level 2 identity attribute alongside SKU.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30"
                >
                  Save Store Connection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
