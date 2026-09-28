'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Boxes,
  Lock,
  ShoppingBag,
  History,
  AlertOctagon,
  FileCheck2,
  Zap,
  Settings,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Stores', href: '/stores', icon: Store },
  { name: 'Shared Inventory', href: '/shared-inventory', icon: Boxes },
  { name: 'Reservations', href: '/reservations', icon: Lock },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Sync History', href: '/sync-history', icon: History },
  { name: 'Errors', href: '/errors', icon: AlertOctagon, badge: true },
  { name: 'Audit Log', href: '/audit-log', icon: FileCheck2 },
  { name: 'Simulator', href: '/simulator', icon: Zap, highlight: true },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col h-screen sticky top-0 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap className="w-5 h-5 text-white animate-pulse-slow" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
              ThriftSync
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-mono">
                v1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">Multi-Store Thrift Sync</p>
          </div>
        </div>
      </div>

      {/* Main Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Management
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : item.highlight
                  ? 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/40'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="flex-1">{item.name}</span>

              {item.highlight && (
                <span className="text-[10px] uppercase tracking-wider font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  Demo
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* System Status & Rules Card */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="glass-card p-3 rounded-xl border border-slate-700/50 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Engine Status
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            Atomic Lock Active • 99% Dropship Rule Enforced • Vercel Ready
          </p>
        </div>
      </div>
    </aside>
  );
}
