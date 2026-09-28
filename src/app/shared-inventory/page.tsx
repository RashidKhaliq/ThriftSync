'use client';

import { useState } from 'react';
import { Boxes, Plus, Filter, Search, Share2, Unlink, Lock, ShieldCheck, Eye, CheckCircle2, AlertOctagon } from 'lucide-react';
import { storeData } from '@/lib/store-data';
import { PhysicalItem, StoreListing, Store } from '@/types';

export default function SharedInventoryPage() {
  const [physicalItems, setPhysicalItems] = useState<PhysicalItem[]>(storeData.getPhysicalItems());
  const [stores] = useState<Store[]>(storeData.getStores());
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectItem, setInspectItem] = useState<PhysicalItem | null>(null);

  // New Item Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemSupplier, setNewItemSupplier] = useState('Store_A');
  const [newItemPrice, setNewItemPrice] = useState('150.00');

  // Share Modal state
  const [shareItem, setShareItem] = useState<PhysicalItem | null>(null);
  const [targetStoreId, setTargetStoreId] = useState<string>('');

  const filteredItems = physicalItems.filter(item => {
    const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleCreatePhysicalItem = (e: React.FormEvent) => {
    e.preventDefault();
    const ownerStore = stores.find(s => s.supplierCode === newItemSupplier) || stores[0];

    const item = storeData.createPhysicalItem({
      title: newItemTitle,
      sku: newItemSku,
      supplier: newItemSupplier,
      originalStoreId: ownerStore.id,
      originalStoreName: ownerStore.name,
      price: parseFloat(newItemPrice) || 100,
      availableQuantity: 1,
      reservedQuantity: 0,
      status: 'AVAILABLE',
      sharingStatus: 'SHARED',
      imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=500&auto=format&fit=crop&q=80'
    });

    setPhysicalItems(storeData.getPhysicalItems());
    setShowAddModal(false);
    setNewItemTitle('');
    setNewItemSku('');
  };

  const handleShareProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareItem || !targetStoreId) return;

    storeData.shareProductWithStore(shareItem.id, targetStoreId);
    setPhysicalItems(storeData.getPhysicalItems());
    setShareItem(null);
  };

  const handleUnshare = (physicalItemId: string, storeId: string) => {
    storeData.unshareProductFromStore(physicalItemId, storeId);
    setPhysicalItems(storeData.getPhysicalItems());
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-emerald-400" />
            Shared Inventory Master Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Physical Item Source of Truth. Resolved by Level 1 (SKU) + Level 2 (custom.supplier) + Level 3 (Explicit Relationship Link).
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Physical Thrift Item
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Title, SKU, Supplier, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 text-xs text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter Status:
          </span>
          {['ALL', 'AVAILABLE', 'RESERVED', 'SOLD', 'UNAVAILABLE'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedStatus === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Physical Items Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider bg-slate-900/60">
                <th className="py-3.5 pl-4">Physical Item</th>
                <th className="py-3.5">SKU + Supplier</th>
                <th className="py-3.5">Original Store</th>
                <th className="py-3.5">Shared Store Listings</th>
                <th className="py-3.5">Price</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredItems.map((item) => {
                const listings = storeData.getListingsByPhysicalItem(item.id);
                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 pl-4 font-medium text-white flex items-center gap-3">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.title} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                      )}
                      <div>
                        <div className="font-semibold">{item.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">ID: {item.id}</div>
                      </div>
                    </td>

                    <td className="py-4">
                      <div className="font-mono text-indigo-300 font-semibold">{item.sku}</div>
                      <div className="text-[11px] font-mono text-amber-300">custom.supplier = {item.supplier}</div>
                    </td>

                    <td className="py-4">
                      <div className="font-semibold text-slate-200">{item.originalStoreName}</div>
                      <span className="text-[10px] text-emerald-400 font-mono">OWNER STORE</span>
                    </td>

                    <td className="py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {listings.map((l) => (
                          <span
                            key={l.id}
                            className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                              l.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                : l.status === 'DRAFT'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {l.storeName.split(' ')[0]} ({l.status})
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 font-bold text-white">${item.price.toFixed(2)}</td>

                    <td className="py-4">
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

                    <td className="py-4 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setInspectItem(item)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                          title="Inspect Listings & State"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {item.status === 'AVAILABLE' && (
                          <button
                            onClick={() => setShareItem(item)}
                            className="p-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition-colors"
                            title="Share product with store"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Detail Drawer Modal */}
      {inspectItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-2xl p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Physical Item Identity & Linked Listings
              </h2>
              <button onClick={() => setInspectItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-400">Physical Item ID:</span>
                  <div className="text-white font-bold">{inspectItem.id}</div>
                </div>

                <div>
                  <span className="text-slate-400">Level 1 & 2 Identity:</span>
                  <div className="text-indigo-300 font-bold">{inspectItem.sku} + {inspectItem.supplier}</div>
                </div>

                <div>
                  <span className="text-slate-400">Original Owner Store:</span>
                  <div className="text-emerald-400 font-bold">{inspectItem.originalStoreName}</div>
                </div>

                <div>
                  <span className="text-slate-400">Current Status:</span>
                  <div className="text-amber-300 font-bold">{inspectItem.status}</div>
                </div>
              </div>

              <h3 className="font-bold text-slate-300 pt-2">Connected Store Representations:</h3>
              <div className="space-y-2">
                {storeData.getListingsByPhysicalItem(inspectItem.id).map(l => (
                  <div key={l.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">{l.storeName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">Product ID: {l.productId} | Variant: {l.variantId}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold font-mono ${
                        l.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {l.status}
                      </span>

                      {!l.isOriginal && (
                        <button
                          onClick={() => {
                            handleUnshare(inspectItem.id, l.storeId);
                            setInspectItem(null);
                          }}
                          className="p-1 rounded bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-[10px]"
                          title="Unshare Listing"
                        >
                          Unshare
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Product Modal */}
      {shareItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-indigo-400" />
                Share Item across Store Catalogs
              </h2>
              <button onClick={() => setShareItem(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleShareProduct} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 font-mono">
                <div className="text-white font-bold">{shareItem.title}</div>
                <div className="text-indigo-300">SKU: {shareItem.sku} | Supplier: {shareItem.supplier}</div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Select Target Store to Share With:</label>
                <select
                  value={targetStoreId}
                  onChange={(e) => setTargetStoreId(e.target.value)}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 focus:border-indigo-500 focus:outline-none"
                  required
                >
                  <option value="">-- Choose Store --</option>
                  {stores.filter(s => s.id !== shareItem.originalStoreId).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.supplierCode})</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShareItem(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30">
                  Establish Shared Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Physical Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-panel w-full max-w-md p-6 rounded-3xl border border-slate-700 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Add Physical Thrift Item
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreatePhysicalItem} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. 80s Vintage Leather Jacket"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">SKU</label>
                  <input
                    type="text"
                    placeholder="e.g. BSD-200"
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                    className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-medium">Owner Supplier</label>
                  <select
                    value={newItemSupplier}
                    onChange={(e) => setNewItemSupplier(e.target.value)}
                    className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 font-mono"
                  >
                    {stores.map(s => (
                      <option key={s.id} value={s.supplierCode}>{s.supplierCode} ({s.name.split(' ')[0]})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-300 font-medium">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30">
                  Save Physical Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
