'use client';

import { useState } from 'react';
import { Search, Bell, RotateCcw, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { storeData } from '@/lib/store-data';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState(storeData.getNotifications());
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  const handleResetDemo = () => {
    storeData.resetToDefaultDemoState();
    setNotifications(storeData.getNotifications());
    setResetMessage('Demo state reset successfully!');
    setTimeout(() => setResetMessage(null), 3000);
    // Refresh page to trigger client updates
    window.location.reload();
  };

  const markAllRead = () => {
    notifications.forEach(n => storeData.markNotificationAsRead(n.id));
    setNotifications(storeData.getNotifications());
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 glass-panel border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Global Search Bar */}
      <div className="relative w-96">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by SKU, Supplier, Item ID, Customer..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/80 text-sm text-slate-200 placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
        />
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-4">
        {/* Reset Demo Button */}
        <button
          onClick={handleResetDemo}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-lg transition-all"
          title="Reset demo data to initial state"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          Reset Demo Data
        </button>

        {resetMessage && (
          <span className="text-xs text-emerald-400 font-medium animate-fade-in">
            {resetMessage}
          </span>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/80 relative transition-all"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-slate-950 animate-pulse" />
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 glass-panel rounded-2xl border border-slate-700 shadow-2xl p-4 z-50 animate-fade-in">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                  Notifications
                  <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-mono">
                    {notifications.length}
                  </span>
                </h3>
                <button
                  onClick={markAllRead}
                  className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  Mark all read
                </button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs ${
                        n.severity === 'CRITICAL'
                          ? 'bg-rose-950/20 border-rose-800/40 text-rose-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="font-medium text-slate-200 mb-0.5">{n.title}</div>
                      <p className="text-[11px] text-slate-400 leading-snug">{n.message}</p>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono">
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center font-bold text-xs text-white">
            TS
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-semibold text-white">Store Admin</div>
            <div className="text-[10px] text-slate-400">admin@thriftsync.com</div>
          </div>
        </div>
      </div>
    </header>
  );
}
