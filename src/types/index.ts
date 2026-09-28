export type StoreStatus = 
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'AUTH_ERROR'
  | 'SYNC_ERROR'
  | 'SYNCING';

export interface Store {
  id: string;
  name: string;
  domain: string;
  supplierCode: string; // e.g. "Store_A", "Store_B", "Store_C"
  status: StoreStatus;
  apiKey?: string;
  accessToken?: string;
  webhookSecret?: string;
  productCount: number;
  orderCount: number;
  lastSyncAt: string;
  createdAt: string;
}

export type InventoryStatus = 
  | 'AVAILABLE'
  | 'RESERVED'
  | 'SOLD'
  | 'UNAVAILABLE'
  | 'SYNC_ERROR';

export type SharingStatus = 
  | 'NOT_SHARED'
  | 'SHARED';

export interface PhysicalItem {
  id: string;
  sku: string;
  supplier: string; // custom.supplier (e.g. Store_A)
  originalStoreId: string;
  originalStoreName: string;
  title: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  price: number;
  availableQuantity: number; // 0 or 1
  reservedQuantity: number; // 0 or 1
  status: InventoryStatus;
  sharingStatus: SharingStatus;
  currentSellingStoreId?: string;
  currentSellingStoreName?: string;
  activeReservationId?: string;
  soldOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export type ListingStatus = 
  | 'ACTIVE'
  | 'DRAFT'
  | 'UNAVAILABLE'
  | 'SOLD';

export interface StoreListing {
  id: string;
  physicalItemId: string;
  storeId: string;
  storeName: string;
  supplier: string; // custom.supplier
  sku: string;
  productId: string;
  variantId: string;
  productTitle: string;
  handle?: string;
  price: number;
  status: ListingStatus;
  isOriginal: boolean;
  lastSyncAt: string;
}

export type ReservationStatus = 
  | 'ACTIVE'
  | 'EXPIRED'
  | 'COMPLETED'
  | 'RELEASED'
  | 'CANCELLED';

export interface Reservation {
  id: string;
  physicalItemId: string;
  sku: string;
  supplier: string;
  originalStoreId: string;
  originalStoreName: string;
  sellingStoreId: string;
  sellingStoreName: string;
  customerName: string;
  customerEmail: string;
  shippingAddress?: string;
  status: ReservationStatus;
  lockedAt: string;
  expiresAt: string;
  releasedAt?: string;
  releaseReason?: string;
}

export type OrderStatus = 
  | 'COMPLETED'
  | 'PROCESSING'
  | 'FAILED'
  | 'CANCELLED';

export type OrderSyncStatus = 
  | 'SUCCESS'
  | 'PENDING'
  | 'FAILED';

export interface Order {
  id: string; // Internal transaction order ID
  physicalItemId: string;
  sku: string;
  supplier: string; // custom.supplier
  originalStoreId: string;
  originalStoreName: string;
  sellingStoreId: string;
  sellingStoreName: string;
  sellingStoreOrderId: string;
  originalStoreOrderId?: string;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  itemPrice: number;
  discountPercentage: number; // Must be 99 for cross-store internal orders
  orderTag: string; // Must be "Dropshipped_Order"
  soldBy: string; // Stores exact selling store name, e.g. "Store_B"
  isCrossStore: boolean;
  status: OrderStatus;
  syncStatus: OrderSyncStatus;
  createdAt: string;
}

export type SyncJobStatus = 
  | 'PENDING'
  | 'PROCESSING'
  | 'RESERVED'
  | 'ORDER_CREATED'
  | 'LISTINGS_UPDATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'RETRYING'
  | 'CANCELLED';

export interface SyncJob {
  transactionId: string;
  physicalItemId: string;
  sku: string;
  supplier: string;
  operation: string;
  sellingStoreId: string;
  originalStoreId: string;
  affectedStoreIds: string[];
  status: SyncJobStatus;
  errorMessage?: string;
  retryCount: number;
  requestPayload?: string;
  responsePayload?: string;
  createdAt: string;
  updatedAt: string;
}

export type WebhookStatus = 
  | 'RECEIVED'
  | 'VERIFIED'
  | 'PROCESSING'
  | 'PROCESSED'
  | 'DUPLICATE'
  | 'REJECTED'
  | 'FAILED';

export interface WebhookEvent {
  id: string;
  externalEventId: string;
  storeId: string;
  storeName: string;
  eventType: 'orders/create' | 'orders/cancelled' | 'inventory/updated' | 'products/update';
  payload: Record<string, any>;
  verificationStatus: WebhookStatus;
  receivedAt: string;
  processedAt?: string;
  errorMessage?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  storeId?: string;
  storeName?: string;
  physicalItemId?: string;
  transactionId?: string;
  previousState?: string;
  newState?: string;
  result: 'SUCCESS' | 'FAILURE' | 'WARNING';
  details: string;
}

export interface SyncError {
  id: string;
  timestamp: string;
  storeId: string;
  storeName: string;
  operation: string;
  physicalItemId?: string;
  sku: string;
  supplier: string;
  productId?: string;
  orderId?: string;
  errorMessage: string;
  retryCount: number;
  status: 'UNRESOLVED' | 'RESOLVED' | 'RETRYING';
  canRetry: boolean;
}

export interface Notification {
  id: string;
  timestamp: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  storeId?: string;
  physicalItemId?: string;
  read: boolean;
}

export interface DashboardMetrics {
  totalStores: number;
  connectedStores: number;
  sharedProducts: number;
  availableSharedInventory: number;
  reservedInventory: number;
  soldInventory: number;
  pendingSyncs: number;
  failedSyncs: number;
  recentOrdersCount: number;
  activeReservationsCount: number;
}
