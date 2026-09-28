import { storeData } from './store-data';
import { PhysicalItem, Reservation, SyncJob, AuditLog } from '@/types';

// In-Memory Mutex Lock Map for Server-Side Atomic Reservation Protection
const activeLocks = new Map<string, { transactionId: string; lockedAt: number }>();

export interface LockResult {
  success: boolean;
  reservation?: Reservation;
  error?: string;
  transactionId: string;
}

export class InventoryEngine {
  /**
   * Acquire Server-Side Atomic Reservation Lock for a physical thrift item.
   * Prevents race conditions when multiple stores receive sales for the same item.
   */
  public static acquireLockAndReserve(params: {
    sku: string;
    supplier: string; // custom.supplier
    sellingStoreId: string;
    sellingStoreName: string;
    customerName: string;
    customerEmail: string;
    shippingAddress?: string;
    externalEventId?: string;
  }): LockResult {
    const transactionId = `txn-${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    // Level 1 & Level 2 Matching: SKU + custom.supplier
    const physicalItem = storeData.findPhysicalItemBySkuAndSupplier(params.sku, params.supplier);

    if (!physicalItem) {
      const err = `No physical item matched SKU '${params.sku}' with supplier '${params.supplier}'. Sync rejected.`;
      storeData.logAudit({
        user: 'InventoryEngine',
        action: 'MATCH_FAILED',
        result: 'FAILURE',
        details: err
      });
      return { success: false, error: err, transactionId };
    }

    const lockKey = `lock:phy:${physicalItem.id}`;

    // Server-Side Atomic Lock Check
    if (activeLocks.has(lockKey)) {
      const currentLock = activeLocks.get(lockKey)!;
      const conflictMsg = `RACE CONDITION PREVENTED! Item '${physicalItem.title}' (ID: ${physicalItem.id}) is already locked by Transaction ${currentLock.transactionId}. Sale attempt from ${params.sellingStoreName} rejected.`;
      
      storeData.recordError({
        storeId: params.sellingStoreId,
        storeName: params.sellingStoreName,
        operation: 'ACQUIRE_RESERVATION_LOCK',
        physicalItemId: physicalItem.id,
        sku: params.sku,
        supplier: params.supplier,
        errorMessage: conflictMsg,
        retryCount: 0,
        canRetry: false
      });

      storeData.logAudit({
        user: 'InventoryEngine (Atomic Lock)',
        action: 'RESERVATION_LOCK_REJECTED',
        physicalItemId: physicalItem.id,
        transactionId,
        result: 'FAILURE',
        details: conflictMsg
      });

      return {
        success: false,
        error: conflictMsg,
        transactionId
      };
    }

    // Check Availability State
    if (physicalItem.status === 'SOLD') {
      const soldMsg = `ITEM ALREADY SOLD! Physical item '${physicalItem.title}' (SKU: ${params.sku}) was previously sold. Cannot reserve.`;
      storeData.logAudit({
        user: 'InventoryEngine',
        action: 'RESERVATION_REJECTED_SOLD',
        physicalItemId: physicalItem.id,
        transactionId,
        result: 'FAILURE',
        details: soldMsg
      });
      return { success: false, error: soldMsg, transactionId };
    }

    if (physicalItem.status === 'RESERVED') {
      const resMsg = `ITEM CURRENTLY RESERVED! Active reservation exists for physical item '${physicalItem.title}'.`;
      storeData.logAudit({
        user: 'InventoryEngine',
        action: 'RESERVATION_REJECTED_RESERVED',
        physicalItemId: physicalItem.id,
        transactionId,
        result: 'FAILURE',
        details: resMsg
      });
      return { success: false, error: resMsg, transactionId };
    }

    if (physicalItem.availableQuantity <= 0) {
      const unavailMsg = `ITEM UNAVAILABLE! Available quantity is 0 for physical item '${physicalItem.title}'.`;
      return { success: false, error: unavailMsg, transactionId };
    }

    // Level 3 Matching: Check Explicit Shared Relationship
    if (physicalItem.sharingStatus !== 'SHARED') {
      const notSharedMsg = `PRODUCT NOT SHARED! Physical item '${physicalItem.title}' does not have an active shared inventory relationship.`;
      return { success: false, error: notSharedMsg, transactionId };
    }

    // Set Atomic Lock
    activeLocks.set(lockKey, { transactionId, lockedAt: Date.now() });

    try {
      // Create Reservation Record & update Physical Item state
      const reservation = storeData.createReservation({
        physicalItemId: physicalItem.id,
        sku: params.sku,
        supplier: params.supplier,
        originalStoreId: physicalItem.originalStoreId,
        originalStoreName: physicalItem.originalStoreName,
        sellingStoreId: params.sellingStoreId,
        sellingStoreName: params.sellingStoreName,
        customerName: params.customerName,
        customerEmail: params.customerEmail,
        shippingAddress: params.shippingAddress || 'Default Address'
      });

      // Record Sync Job
      storeData.addSyncJob({
        physicalItemId: physicalItem.id,
        sku: params.sku,
        supplier: params.supplier,
        operation: 'RESERVE_PHYSICAL_ITEM',
        sellingStoreId: params.sellingStoreId,
        originalStoreId: physicalItem.originalStoreId,
        affectedStoreIds: [params.sellingStoreId, physicalItem.originalStoreId],
        status: 'RESERVED',
        retryCount: 0,
        requestPayload: JSON.stringify(params),
        responsePayload: JSON.stringify({ reservationId: reservation.id, transactionId })
      });

      return {
        success: true,
        reservation,
        transactionId
      };
    } finally {
      // Keep lock active until order sync completes or release explicitly
      setTimeout(() => {
        if (activeLocks.get(lockKey)?.transactionId === transactionId) {
          activeLocks.delete(lockKey);
        }
      }, 30000); // 30s max lock safety threshold
    }
  }

  /**
   * Release Atomic Lock for a physical item
   */
  public static releaseLock(physicalItemId: string): void {
    const lockKey = `lock:phy:${physicalItemId}`;
    activeLocks.delete(lockKey);
  }
}
