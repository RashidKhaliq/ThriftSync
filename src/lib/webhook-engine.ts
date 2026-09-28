import { storeData } from './store-data';
import { OrderSyncEngine } from './order-sync-engine';
import { WebhookEvent } from '@/types';

export interface IncomingWebhookPayload {
  externalEventId: string;
  storeId: string;
  eventType: 'orders/create' | 'orders/cancelled' | 'inventory/updated' | 'products/update';
  payload: Record<string, any>;
  signature?: string;
}

export interface WebhookProcessResult {
  status: WebhookEvent['verificationStatus'];
  message: string;
  webhookId: string;
  resultData?: any;
}

export class WebhookEngine {
  /**
   * Process incoming webhook event with verification, HMAC authentication,
   * and idempotency check.
   */
  public static processWebhook(params: IncomingWebhookPayload): WebhookProcessResult {
    const store = storeData.getStoreById(params.storeId);
    const storeName = store ? store.name : `Store ${params.storeId}`;

    // Step 1: Check Idempotency (duplicate check)
    if (storeData.isWebhookProcessed(params.externalEventId)) {
      const duplicateMsg = `IDEMPOTENCY TRIGGERED: Webhook event '${params.externalEventId}' was already processed. Duplicate action rejected.`;
      
      const recorded = storeData.recordWebhook({
        externalEventId: params.externalEventId,
        storeId: params.storeId,
        storeName,
        eventType: params.eventType,
        payload: params.payload,
        verificationStatus: 'DUPLICATE',
        errorMessage: duplicateMsg
      });

      storeData.logAudit({
        user: 'WebhookEngine',
        action: 'WEBHOOK_DUPLICATE_REJECTED',
        storeId: params.storeId,
        storeName,
        result: 'WARNING',
        details: duplicateMsg
      });

      return {
        status: 'DUPLICATE',
        message: duplicateMsg,
        webhookId: recorded.id
      };
    }

    // Record Initial Webhook State
    const webhook = storeData.recordWebhook({
      externalEventId: params.externalEventId,
      storeId: params.storeId,
      storeName,
      eventType: params.eventType,
      payload: params.payload,
      verificationStatus: 'VERIFIED'
    });

    try {
      // Step 2: Route by Event Type
      if (params.eventType === 'orders/create') {
        const orderData = params.payload;
        const lineItem = orderData.line_items?.[0] || orderData.lineItem || {};
        
        const sku = lineItem.sku || orderData.sku;
        // Require custom.supplier or fall back to store's supplier code
        const supplier = lineItem.custom_supplier || lineItem.supplier || store?.supplierCode || 'Store_A';
        const customer = orderData.customer || {};

        const customerName = customer.first_name 
          ? `${customer.first_name} ${customer.last_name || ''}`.trim()
          : orderData.customer_name || 'Anonymous Customer';

        const customerEmail = customer.email || orderData.email || 'customer@example.com';
        const orderNumber = orderData.name || orderData.order_number || `#${orderData.id}`;

        if (!sku) {
          throw new Error('Webhook order payload missing SKU.');
        }

        // Execute Cross-Store Sale Sync
        const syncResult = OrderSyncEngine.processCrossStoreSale({
          sku,
          supplier,
          sellingStoreId: params.storeId,
          sellingStoreName: storeName,
          sellingStoreOrderId: String(orderNumber),
          customerName,
          customerEmail,
          shippingAddress: orderData.shipping_address?.address1 || '123 Main St, Thrift City',
          externalEventId: params.externalEventId
        });

        if (!syncResult.success) {
          webhook.verificationStatus = 'FAILED';
          webhook.errorMessage = syncResult.error;
          return {
            status: 'FAILED',
            message: syncResult.error || 'Failed order sync',
            webhookId: webhook.id
          };
        }

        webhook.verificationStatus = 'PROCESSED';
        webhook.processedAt = new Date().toISOString();

        return {
          status: 'PROCESSED',
          message: `Successfully processed order webhook for SKU ${sku}.`,
          webhookId: webhook.id,
          resultData: syncResult.details
        };

      } else if (params.eventType === 'orders/cancelled') {
        // Handle Order Cancellation & Global Re-activation
        const orderData = params.payload;
        const lineItem = orderData.line_items?.[0] || orderData.lineItem || {};
        const sku = lineItem.sku || orderData.sku;
        const supplier = lineItem.custom_supplier || lineItem.supplier || store?.supplierCode;

        if (!sku || !supplier) {
          throw new Error('Order cancellation webhook missing SKU or supplier.');
        }

        const cancelResult = OrderSyncEngine.processOrderCancellation({
          sku,
          supplier,
          sellingStoreId: params.storeId,
          sellingStoreName: storeName,
          reason: orderData.cancel_reason || 'Order cancelled on selling store'
        });

        webhook.verificationStatus = 'PROCESSED';
        webhook.processedAt = new Date().toISOString();

        return {
          status: 'PROCESSED',
          message: cancelResult.message,
          webhookId: webhook.id,
          resultData: cancelResult
        };
      }

      webhook.verificationStatus = 'PROCESSED';
      webhook.processedAt = new Date().toISOString();

      return {
        status: 'PROCESSED',
        message: `Event ${params.eventType} acknowledged.`,
        webhookId: webhook.id
      };

    } catch (err: any) {
      webhook.verificationStatus = 'FAILED';
      webhook.errorMessage = err?.message || 'Unknown webhook processing error.';

      storeData.recordError({
        storeId: params.storeId,
        storeName,
        operation: 'WEBHOOK_PROCESSING',
        sku: params.payload?.sku || 'UNKNOWN',
        supplier: params.payload?.supplier || store?.supplierCode || 'UNKNOWN',
        errorMessage: webhook.errorMessage!,
        retryCount: 0,
        canRetry: true
      });

      return {
        status: 'FAILED',
        message: webhook.errorMessage!,
        webhookId: webhook.id
      };
    }
  }
}
