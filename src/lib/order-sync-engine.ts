import { storeData } from './store-data';
import { InventoryEngine } from './inventory-engine';
import { Order, SyncJob, AuditLog } from '@/types';

export interface ProcessCrossStoreSaleParams {
  sku: string;
  supplier: string; // custom.supplier (e.g. Store_A)
  sellingStoreId: string;
  sellingStoreName: string;
  sellingStoreOrderId: string;
  customerName: string;
  customerEmail: string;
  shippingAddress?: string;
  externalEventId?: string;
}

export interface CrossStoreSaleResult {
  success: boolean;
  order?: Order;
  error?: string;
  transactionId: string;
  details?: {
    originalStoreName: string;
    sellingStoreName: string;
    discountPercentage: number;
    orderTag: string;
    draftedStoreCount: number;
    physicalItemId: string;
  };
}

export class OrderSyncEngine {
  /**
   * Complete End-to-End Cross-Store Sale & Synchronization Engine
   * Implements 99% discount rule, exact tag "Dropshipped_Order",
   * customer info transfer, Store C product drafting, and audit logging.
   */
  public static processCrossStoreSale(params: ProcessCrossStoreSaleParams): CrossStoreSaleResult {
    // Step 1: Acquire Atomic Lock & Reserve Physical Item
    const lockResult = InventoryEngine.acquireLockAndReserve({
      sku: params.sku,
      supplier: params.supplier,
      sellingStoreId: params.sellingStoreId,
      sellingStoreName: params.sellingStoreName,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      shippingAddress: params.shippingAddress,
      externalEventId: params.externalEventId
    });

    if (!lockResult.success || !lockResult.reservation) {
      return {
        success: false,
        error: lockResult.error || 'Failed to acquire reservation lock.',
        transactionId: lockResult.transactionId
      };
    }

    const reservation = lockResult.reservation;
    const transactionId = lockResult.transactionId;
    const physicalItem = storeData.getPhysicalItemById(reservation.physicalItemId)!;

    try {
      // Check if Sale is Cross-Store vs Local Store Sale
      const isCrossStore = physicalItem.originalStoreId !== params.sellingStoreId;

      // Step 2: Create Internal Dropship Order on Original Store (if cross-store)
      const internalOrderNumber = `#${Math.floor(1000 + Math.random() * 9000)}`;

      const order = storeData.createOrder({
        physicalItemId: physicalItem.id,
        sku: params.sku,
        supplier: params.supplier,
        originalStoreId: physicalItem.originalStoreId,
        originalStoreName: physicalItem.originalStoreName,
        sellingStoreId: params.sellingStoreId,
        sellingStoreName: params.sellingStoreName,
        sellingStoreOrderId: params.sellingStoreOrderId,
        originalStoreOrderId: internalOrderNumber,
        customerName: params.customerName, // Transferred from Selling Store
        customerEmail: params.customerEmail, // Transferred from Selling Store
        shippingAddress: params.shippingAddress || '742 Evergreen Terrace, Springfield, OR 97477',
        itemPrice: physicalItem.price,
        discountPercentage: isCrossStore ? 99 : 0, // MUST BE 99% FOR CROSS-STORE INTERNAL ORDER
        orderTag: 'Dropshipped_Order', // EXACT MANDATORY TAG SPELLING
        soldBy: params.sellingStoreName, // Identifies selling store on original store order
        isCrossStore,
        status: 'COMPLETED',
        syncStatus: 'SUCCESS'
      });

      // Step 3: Update Connected Store Listings (Draft/Unpublish Store C, D, etc.)
      const allListings = storeData.getListingsByPhysicalItem(physicalItem.id);
      let draftedCount = 0;

      allListings.forEach(listing => {
        if (listing.storeId === params.sellingStoreId) {
          // Selling store listing is completed/sold
          storeData.updateListingStatus(listing.id, 'SOLD');
        } else if (listing.storeId === physicalItem.originalStoreId) {
          // Owner store listing is sold / unavailable
          storeData.updateListingStatus(listing.id, 'SOLD');
        } else {
          // Third-party store listings (e.g. Store C) MUST BE DRAFTED / MADE UNAVAILABLE
          storeData.updateListingStatus(listing.id, 'DRAFT');
          draftedCount++;
        }
      });

      // Step 4: Complete Reservation State
      reservation.status = 'COMPLETED';

      // Release Lock
      InventoryEngine.releaseLock(physicalItem.id);

      // Step 5: Record Complete Sync Job Result
      storeData.addSyncJob({
        physicalItemId: physicalItem.id,
        sku: params.sku,
        supplier: params.supplier,
        operation: 'CROSS_STORE_DROPSHIP_COMPLETED',
        sellingStoreId: params.sellingStoreId,
        originalStoreId: physicalItem.originalStoreId,
        affectedStoreIds: allListings.map(l => l.storeId),
        status: 'COMPLETED',
        retryCount: 0,
        responsePayload: JSON.stringify({
          orderId: order.id,
          internalOrder: internalOrderNumber,
          discountPercentage: 99,
          orderTag: 'Dropshipped_Order',
          soldBy: params.sellingStoreName,
          draftedStoreListingsCount: draftedCount
        })
      });

      // Step 6: Log Detailed Immutable Audit Event
      storeData.logAudit({
        user: 'OrderSyncEngine',
        action: 'CROSS_STORE_DROPSHIP_SUCCESS',
        physicalItemId: physicalItem.id,
        storeId: physicalItem.originalStoreId,
        storeName: physicalItem.originalStoreName,
        transactionId,
        previousState: 'RESERVED',
        newState: 'SOLD',
        result: 'SUCCESS',
        details: `Cross-store order synchronized! Store ${params.sellingStoreName} sold item owned by ${physicalItem.originalStoreName}. Created order ${internalOrderNumber} on ${physicalItem.originalStoreName} with 99% discount and tag Dropshipped_Order. Drafted ${draftedCount} other store listings.`
      });

      // Step 7: Push System Notification
      storeData.addNotification({
        severity: 'INFO',
        title: 'Cross-Store Order Synchronized',
        message: `${params.sellingStoreName} sold SKU ${params.sku} (${params.supplier}). Internal order ${internalOrderNumber} created on ${physicalItem.originalStoreName} (99% discount).`,
        storeId: params.sellingStoreId,
        physicalItemId: physicalItem.id
      });

      return {
        success: true,
        order,
        transactionId,
        details: {
          originalStoreName: physicalItem.originalStoreName,
          sellingStoreName: params.sellingStoreName,
          discountPercentage: 99,
          orderTag: 'Dropshipped_Order',
          draftedStoreCount: draftedCount,
          physicalItemId: physicalItem.id
        }
      };

    } catch (err: any) {
      InventoryEngine.releaseLock(physicalItem.id);

      const errorMessage = err?.message || 'Failed during cross-store order synchronization execution.';

      storeData.recordError({
        storeId: params.sellingStoreId,
        storeName: params.sellingStoreName,
        operation: 'CROSS_STORE_ORDER_SYNC',
        physicalItemId: physicalItem.id,
        sku: params.sku,
        supplier: params.supplier,
        errorMessage,
        retryCount: 0,
        canRetry: true
      });

      return {
        success: false,
        error: errorMessage,
        transactionId
      };
    }
  }

  /**
   * Complete Cancellation Workflow (Global Inventory Restoration)
   * Triggered when seller cancels order on selling store.
   * Reads SKU + Supplier, restores physical item status to AVAILABLE (quantity 1),
   * re-activates ALL connected store listings (Store A, Store B, Store C) to ACTIVE,
   * releases any reservation lock, and records audit history.
   */
  public static processOrderCancellation(params: {
    sku: string;
    supplier: string;
    sellingStoreId: string;
    sellingStoreName: string;
    reason?: string;
  }): { success: boolean; message: string; physicalItemId?: string } {
    const physicalItem = storeData.findPhysicalItemBySkuAndSupplier(params.sku, params.supplier);

    if (!physicalItem) {
      return {
        success: false,
        message: `No physical item found for SKU ${params.sku} + Supplier ${params.supplier} to cancel.`
      };
    }

    // 1. Release active reservation lock if any exists
    if (physicalItem.activeReservationId) {
      storeData.releaseReservation(physicalItem.activeReservationId, params.reason || 'Selling store order cancelled');
    }

    // 2. Globally restore physical item availability
    physicalItem.availableQuantity = 1;
    physicalItem.reservedQuantity = 0;
    physicalItem.status = 'AVAILABLE';
    physicalItem.currentSellingStoreId = undefined;
    physicalItem.currentSellingStoreName = undefined;
    physicalItem.activeReservationId = undefined;
    physicalItem.updatedAt = new Date().toISOString();

    // 3. Global Re-activation across ALL connected store listings (Store A, Store B, Store C)
    const allListings = storeData.getListingsByPhysicalItem(physicalItem.id);
    let reactivatedCount = 0;

    allListings.forEach(listing => {
      storeData.updateListingStatus(listing.id, 'ACTIVE');
      reactivatedCount++;
    });

    // 4. Update corresponding internal order status if present
    const existingOrders = storeData.getOrders().filter(o => o.physicalItemId === physicalItem.id);
    existingOrders.forEach(o => {
      o.status = 'CANCELLED';
    });

    // 5. Log audit event
    storeData.logAudit({
      user: 'OrderSyncEngine (Cancellation)',
      action: 'GLOBAL_INVENTORY_RESTORED',
      physicalItemId: physicalItem.id,
      storeId: params.sellingStoreId,
      storeName: params.sellingStoreName,
      previousState: 'SOLD / RESERVED',
      newState: 'AVAILABLE',
      result: 'SUCCESS',
      details: `Order cancelled on ${params.sellingStoreName}. Physical item ${params.sku} (${params.supplier}) restored to AVAILABLE. Re-activated ${reactivatedCount} store listings globally.`
    });

    // 6. Push system notification
    storeData.addNotification({
      severity: 'INFO',
      title: 'Global Inventory Restored on Cancellation',
      message: `Order cancelled for ${params.sku} (${params.supplier}). Item restored to ACTIVE across all ${reactivatedCount} connected stores.`,
      storeId: params.sellingStoreId,
      physicalItemId: physicalItem.id
    });

    return {
      success: true,
      message: `Global cancellation processed for ${params.sku} (${params.supplier}). Restored ${reactivatedCount} store listings to ACTIVE.`,
      physicalItemId: physicalItem.id
    };
  }
}
