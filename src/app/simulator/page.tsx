'use client';

import { useState } from 'react';
import { Zap, Play, ShieldAlert, CheckCircle2, AlertOctagon, RotateCcw, ArrowRight, Layers, Tag, Percent, Code } from 'lucide-react';
import { WebhookEngine } from '@/lib/webhook-engine';
import { storeData } from '@/lib/store-data';

export default function SimulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState<string>('CROSS_STORE_SALE');
  const [sellingStore, setSellingStore] = useState<string>('store-2'); // Store B
  const [targetSku, setTargetSku] = useState<string>('BSD-102');
  const [targetSupplier, setTargetSupplier] = useState<string>('Store_A');
  const [customerName, setCustomerName] = useState<string>('John Wick');
  const [customerEmail, setCustomerEmail] = useState<string>('john.wick@continental.com');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  const runCrossStoreSaleSimulation = () => {
    setIsRunning(true);
    setTestResults([]);

    const externalEventId = `sim_evt_${Date.now()}`;
    const storeObj = storeData.getStoreById(sellingStore);

    const result = WebhookEngine.processWebhook({
      externalEventId,
      storeId: sellingStore,
      eventType: 'orders/create',
      payload: {
        id: Math.floor(1000 + Math.random() * 9000),
        order_number: 2045,
        email: customerEmail,
        customer: { first_name: customerName.split(' ')[0], last_name: customerName.split(' ')[1] || '', email: customerEmail },
        line_items: [
          { sku: targetSku, custom_supplier: targetSupplier, name: `Thrift Item ${targetSku}`, price: '185.00', quantity: 1 }
        ]
      }
    });

    setTestResults([{
      title: 'Single Cross-Store Sale Execution',
      status: result.status,
      message: result.message,
      data: result.resultData
    }]);

    setIsRunning(false);
  };

  const runRaceConditionSimulation = () => {
    setIsRunning(true);
    setTestResults([]);

    const externalEventId1 = `sim_race_b_${Date.now()}`;
    const externalEventId2 = `sim_race_c_${Date.now()}`;

    // Reset item status to AVAILABLE first if needed
    const phy = storeData.findPhysicalItemBySkuAndSupplier(targetSku, targetSupplier);
    if (phy && (phy.status === 'SOLD' || phy.status === 'RESERVED')) {
      phy.status = 'AVAILABLE';
      phy.availableQuantity = 1;
      phy.reservedQuantity = 0;
    }

    // First store (Store B) tries to buy
    const res1 = WebhookEngine.processWebhook({
      externalEventId: externalEventId1,
      storeId: 'store-2', // Store B
      eventType: 'orders/create',
      payload: {
        id: 301,
        email: 'alice@example.com',
        customer: { first_name: 'Alice', last_name: 'Smith' },
        line_items: [{ sku: targetSku, custom_supplier: targetSupplier, price: '185.00', quantity: 1 }]
      }
    });

    // Second store (Store C) tries to buy SAME physical item simultaneously
    const res2 = WebhookEngine.processWebhook({
      externalEventId: externalEventId2,
      storeId: 'store-3', // Store C
      eventType: 'orders/create',
      payload: {
        id: 302,
        email: 'bob@example.com',
        customer: { first_name: 'Bob', last_name: 'Jones' },
        line_items: [{ sku: targetSku, custom_supplier: targetSupplier, price: '185.00', quantity: 1 }]
      }
    });

    setTestResults([
      {
        title: 'Store B Concurrent Purchase Attempt',
        status: res1.status,
        message: res1.message,
        data: res1.resultData
      },
      {
        title: 'Store C Concurrent Purchase Attempt (Race Condition)',
        status: res2.status,
        message: res2.message,
        data: res2.resultData
      }
    ]);

    setIsRunning(false);
  };

  const runIdempotencyDuplicateTest = () => {
    setIsRunning(true);
    setTestResults([]);

    const duplicateEventId = `sim_dup_${Date.now()}`;

    // First attempt
    const res1 = WebhookEngine.processWebhook({
      externalEventId: duplicateEventId,
      storeId: 'store-2',
      eventType: 'orders/create',
      payload: {
        id: 501,
        email: customerEmail,
        line_items: [{ sku: targetSku, custom_supplier: targetSupplier, price: '185.00', quantity: 1 }]
      }
    });

    // Exact duplicate attempt with same externalEventId
    const res2 = WebhookEngine.processWebhook({
      externalEventId: duplicateEventId,
      storeId: 'store-2',
      eventType: 'orders/create',
      payload: {
        id: 501,
        email: customerEmail,
        line_items: [{ sku: targetSku, custom_supplier: targetSupplier, price: '185.00', quantity: 1 }]
      }
    });

    setTestResults([
      {
        title: 'First Webhook Event Delivery',
        status: res1.status,
        message: res1.message
      },
      {
        title: 'Duplicate Webhook Event Delivery (Idempotency Check)',
        status: res2.status,
        message: res2.message
      }
    ]);

    setIsRunning(false);
  };

  const runCancellationSimulation = () => {
    setIsRunning(true);
    setTestResults([]);

    const externalEventId = `sim_cancel_${Date.now()}`;

    // First ensure the item is marked as sold/reserved so we can observe the cancellation restoration
    const phy = storeData.findPhysicalItemBySkuAndSupplier(targetSku, targetSupplier);
    if (phy && phy.status === 'AVAILABLE') {
      // Simulate sale first
      WebhookEngine.processWebhook({
        externalEventId: `sim_pre_sale_${Date.now()}`,
        storeId: sellingStore,
        eventType: 'orders/create',
        payload: {
          id: 999,
          email: customerEmail,
          line_items: [{ sku: targetSku, custom_supplier: targetSupplier, price: '185.00', quantity: 1 }]
        }
      });
    }

    // Now fire orders/cancelled webhook
    const cancelRes = WebhookEngine.processWebhook({
      externalEventId,
      storeId: sellingStore,
      eventType: 'orders/cancelled',
      payload: {
        id: 999,
        cancel_reason: 'Customer requested cancellation',
        line_items: [{ sku: targetSku, custom_supplier: targetSupplier }]
      }
    });

    setTestResults([
      {
        title: 'Order Cancellation & Global Re-activation',
        status: cancelRes.status,
        message: cancelRes.message,
        data: cancelRes.resultData
      }
    ]);

    setIsRunning(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-amber-400" />
            Live Webhook & Race Condition Simulator
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Test cross-store dropship workflows, atomic reservation locks, 99% discount order creation, cancellation re-activation, and idempotency duplicate detection live out-of-the-box.
          </p>
        </div>
      </div>

      {/* Scenario Chooser Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => setSelectedScenario('CROSS_STORE_SALE')}
          className={`p-4 rounded-2xl text-left border transition-all ${
            selectedScenario === 'CROSS_STORE_SALE'
              ? 'glass-panel border-indigo-500/50 bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
              : 'glass-card border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Scenario 1</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <h3 className="font-bold text-white text-xs">Cross-Store Dropship Sale</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Store B sells SKU BSD-102 (Store_A). Creates order on Store A with 99% discount & Dropshipped_Order tag. Drafts Store C product.
          </p>
        </button>

        <button
          onClick={() => setSelectedScenario('RACE_CONDITION')}
          className={`p-4 rounded-2xl text-left border transition-all ${
            selectedScenario === 'RACE_CONDITION'
              ? 'glass-panel border-amber-500/50 bg-amber-950/20 shadow-lg shadow-amber-500/10'
              : 'glass-card border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Scenario 2</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="font-bold text-white text-xs">Concurrent Race Condition</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Store B and Store C try to buy same item simultaneously. Server lock allows 1 and rejects 1.
          </p>
        </button>

        <button
          onClick={() => setSelectedScenario('IDEMPOTENCY')}
          className={`p-4 rounded-2xl text-left border transition-all ${
            selectedScenario === 'IDEMPOTENCY'
              ? 'glass-panel border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
              : 'glass-card border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Scenario 3</span>
            <RotateCcw className="w-4 h-4 text-emerald-400" />
          </div>
          <h3 className="font-bold text-white text-xs">Duplicate Webhook Idempotency</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Same order webhook delivered twice. First completes sale; second recognized as duplicate.
          </p>
        </button>

        <button
          onClick={() => setSelectedScenario('CANCELLATION')}
          className={`p-4 rounded-2xl text-left border transition-all ${
            selectedScenario === 'CANCELLATION'
              ? 'glass-panel border-purple-500/50 bg-purple-950/20 shadow-lg shadow-purple-500/10'
              : 'glass-card border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Scenario 4</span>
            <RotateCcw className="w-4 h-4 text-purple-400" />
          </div>
          <h3 className="font-bold text-white text-xs">Order Cancellation Sync</h3>
          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
            Order cancelled on selling store. Restores item quantity back to 1 and re-activates ALL connected store listings globally.
          </p>
        </button>
      </div>

      {/* Simulator Control Configuration Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-300">
          Simulation Parameters Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Selling Store</label>
            <select
              value={sellingStore}
              onChange={(e) => setSellingStore(e.target.value)}
              className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 font-mono"
            >
              <option value="store-2">Store B (Retro Wear)</option>
              <option value="store-3">Store C (Vintage Vault)</option>
              <option value="store-4">Store D (Urban Thrift Co)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Target SKU</label>
            <input
              type="text"
              value={targetSku}
              onChange={(e) => setTargetSku(e.target.value)}
              className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Supplier Code (custom.supplier)</label>
            <input
              type="text"
              value={targetSupplier}
              onChange={(e) => setTargetSupplier(e.target.value)}
              className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium">Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              if (selectedScenario === 'CROSS_STORE_SALE') runCrossStoreSaleSimulation();
              else if (selectedScenario === 'RACE_CONDITION') runRaceConditionSimulation();
              else if (selectedScenario === 'IDEMPOTENCY') runIdempotencyDuplicateTest();
              else if (selectedScenario === 'CANCELLATION') runCancellationSimulation();
            }}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            Execute Live Simulation
          </button>
        </div>
      </div>

      {/* Execution Results Inspector */}
      {testResults.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4 animate-fade-in">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Simulation Execution Diagnostics
          </h3>

          <div className="space-y-4">
            {testResults.map((res, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border space-y-2 text-xs font-mono ${
                  res.status === 'PROCESSED'
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : res.status === 'DUPLICATE'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : 'bg-rose-950/20 border-rose-500/30 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{res.title}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border text-[10px]">
                    STATUS: {res.status}
                  </span>
                </div>

                <p className="font-sans text-slate-300 leading-relaxed">{res.message}</p>

                {res.data && (
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] space-y-1 font-sans">
                    <div className="text-emerald-400 font-bold">Execution Highlights:</div>
                    <div>• Original Store: <strong>{res.data.originalStoreName}</strong></div>
                    <div>• Selling Store: <strong>{res.data.sellingStoreName}</strong></div>
                    <div>• Internal Order Discount: <strong>{res.data.discountPercentage}%</strong></div>
                    <div>• Mandatory Tag: <code className="bg-slate-900 px-1 py-0.5 rounded text-indigo-300 font-mono">{res.data.orderTag}</code></div>
                    <div>• Other Store Listings Drafted: <strong>{res.data.draftedStoreCount} stores</strong></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
