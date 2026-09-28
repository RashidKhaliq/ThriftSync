import {
  Store,
  PhysicalItem,
  StoreListing,
  Reservation,
  Order,
  SyncJob,
  WebhookEvent,
  AuditLog,
  SyncError,
  Notification,
  DashboardMetrics
} from '@/types';

// In-Memory Database Store for ThriftSync Application
class ThriftSyncDataStore {
  private stores: Store[] = [
    {
      id: 'store-1',
      name: process.env.STORE_A_NAME || 'Store A (Boutique Thrift)',
      domain: process.env.STORE_A_DOMAIN || 'store-a-thrift.myshopify.com',
      supplierCode: process.env.STORE_A_SUPPLIER_CODE || 'Store_A',
      status: 'CONNECTED',
      apiKey: process.env.STORE_A_API_TOKEN || 'shpca_a1b2c3d4e5f6g7h8i9j0_store_a_demo',
      webhookSecret: process.env.STORE_A_WEBHOOK_SECRET || 'whsec_store_a_secret_9988776655',
      productCount: 142,
      orderCount: 38,
      lastSyncAt: new Date(Date.now() - 5 * 60000).toISOString(),
      createdAt: '2026-01-15T08:00:00.000Z'
    },
    {
      id: 'store-2',
      name: process.env.STORE_B_NAME || 'Store B (Retro Wear)',
      domain: process.env.STORE_B_DOMAIN || 'store-b-retro.myshopify.com',
      supplierCode: process.env.STORE_B_SUPPLIER_CODE || 'Store_B',
      status: 'CONNECTED',
      apiKey: process.env.STORE_B_API_TOKEN || 'shpca_b1c2d3e4f5g6h7i8j9k0_store_b_demo',
      webhookSecret: process.env.STORE_B_WEBHOOK_SECRET || 'whsec_store_b_secret_9988776655',
      productCount: 98,
      orderCount: 29,
      lastSyncAt: new Date(Date.now() - 2 * 60000).toISOString(),
      createdAt: '2026-01-18T10:30:00.000Z'
    },
    {
      id: 'store-3',
      name: process.env.STORE_C_NAME || 'Store C (Vintage Vault)',
      domain: process.env.STORE_C_DOMAIN || 'store-c-vintage.myshopify.com',
      supplierCode: process.env.STORE_C_SUPPLIER_CODE || 'Store_C',
      status: 'CONNECTED',
      apiKey: process.env.STORE_C_API_TOKEN || 'shpca_c1d2e3f4g5h6i7j8k9l0_store_c_demo',
      webhookSecret: process.env.STORE_C_WEBHOOK_SECRET || 'whsec_store_c_secret_9988776655',
      productCount: 115,
      orderCount: 41,
      lastSyncAt: new Date(Date.now() - 12 * 60000).toISOString(),
      createdAt: '2026-02-01T14:15:00.000Z'
    },
    {
      id: 'store-4',
      name: 'Store D (Urban Thrift Co)',
      domain: 'store-d-urban.myshopify.com',
      supplierCode: 'Store_D',
      status: 'CONNECTED',
      productCount: 84,
      orderCount: 19,
      lastSyncAt: new Date(Date.now() - 45 * 60000).toISOString(),
      createdAt: '2026-02-10T11:00:00.000Z'
    }
  ];

  private physicalItems: PhysicalItem[] = [
    {
      id: 'item-phy-101',
      sku: 'BSD-102',
      supplier: 'Store_A',
      originalStoreId: 'store-1',
      originalStoreName: 'Store A (Boutique Thrift)',
      title: 'Vintage 90s Leather Biker Jacket',
      description: 'Authentic 100% genuine black leather motorcycle jacket with brass zippers.',
      category: 'Outerwear',
      imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&auto=format&fit=crop&q=80',
      price: 185.00,
      availableQuantity: 1,
      reservedQuantity: 0,
      status: 'AVAILABLE',
      sharingStatus: 'SHARED',
      createdAt: '2026-03-01T09:00:00.000Z',
      updatedAt: '2026-03-01T09:00:00.000Z'
    },
    {
      id: 'item-phy-102',
      sku: 'BSD-102',
      supplier: 'Store_C',
      originalStoreId: 'store-3',
      originalStoreName: 'Store C (Vintage Vault)',
      title: 'Retro Oversized Denim Trucker Jacket',
      description: 'Washed indigo denim shirt with classic fleece collar.',
      category: 'Outerwear',
      imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&auto=format&fit=crop&q=80',
      price: 120.00,
      availableQuantity: 1,
      reservedQuantity: 0,
      status: 'AVAILABLE',
      sharingStatus: 'SHARED',
      createdAt: '2026-03-02T10:00:00.000Z',
      updatedAt: '2026-03-02T10:00:00.000Z'
    },
    {
      id: 'item-phy-103',
      sku: 'WBSD-105',
      supplier: 'Store_B',
      originalStoreId: 'store-2',
      originalStoreName: 'Store B (Retro Wear)',
      title: '70s Disco Graphic Band Tee - Original Tour Edition',
      description: 'Single stitch vintage concert t-shirt in cream cotton.',
      category: 'T-Shirts',
      imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
      price: 95.00,
      availableQuantity: 1,
      reservedQuantity: 0,
      status: 'AVAILABLE',
      sharingStatus: 'SHARED',
      createdAt: '2026-03-05T14:30:00.000Z',
      updatedAt: '2026-03-05T14:30:00.000Z'
    },
    {
      id: 'item-phy-104',
      sku: 'VINT-881',
      supplier: 'Store_A',
      originalStoreId: 'store-1',
      originalStoreName: 'Store A (Boutique Thrift)',
      title: 'Hand-Knitted Chunky Wool Sweater',
      description: 'Patterned Nordic wool sweater in mustard and cream.',
      category: 'Knitwear',
      imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=500&auto=format&fit=crop&q=80',
      price: 140.00,
      availableQuantity: 0,
      reservedQuantity: 0,
      status: 'SOLD',
      sharingStatus: 'SHARED',
      currentSellingStoreId: 'store-2',
      currentSellingStoreName: 'Store B (Retro Wear)',
      soldOrderId: 'ord-cross-5501',
      createdAt: '2026-03-10T11:20:00.000Z',
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  private listings: StoreListing[] = [
    // Physical Item 101 (Owner: Store A, Shared: Store B, Store C)
    {
      id: 'list-101-a',
      physicalItemId: 'item-phy-101',
      storeId: 'store-1',
      storeName: 'Store A (Boutique Thrift)',
      supplier: 'Store_A',
      sku: 'BSD-102',
      productId: 'prod-shp-a101',
      variantId: 'var-shp-a101-1',
      productTitle: 'Vintage 90s Leather Biker Jacket',
      price: 185.00,
      status: 'ACTIVE',
      isOriginal: true,
      lastSyncAt: new Date().toISOString()
    },
    {
      id: 'list-101-b',
      physicalItemId: 'item-phy-101',
      storeId: 'store-2',
      storeName: 'Store B (Retro Wear)',
      supplier: 'Store_A',
      sku: 'BSD-102',
      productId: 'prod-shp-b101',
      variantId: 'var-shp-b101-1',
      productTitle: 'Vintage 90s Leather Biker Jacket (Shared)',
      price: 185.00,
      status: 'ACTIVE',
      isOriginal: false,
      lastSyncAt: new Date().toISOString()
    },
    {
      id: 'list-101-c',
      physicalItemId: 'item-phy-101',
      storeId: 'store-3',
      storeName: 'Store C (Vintage Vault)',
      supplier: 'Store_A',
      sku: 'BSD-102',
      productId: 'prod-shp-c101',
      variantId: 'var-shp-c101-1',
      productTitle: 'Vintage 90s Leather Biker Jacket (Shared)',
      price: 185.00,
      status: 'ACTIVE',
      isOriginal: false,
      lastSyncAt: new Date().toISOString()
    },

    // Physical Item 102 (Owner: Store C, Shared: Store A, Store B)
    {
      id: 'list-102-c',
      physicalItemId: 'item-phy-102',
      storeId: 'store-3',
      storeName: 'Store C (Vintage Vault)',
      supplier: 'Store_C',
      sku: 'BSD-102',
      productId: 'prod-shp-c102',
      variantId: 'var-shp-c102-1',
      productTitle: 'Retro Oversized Denim Trucker Jacket',
      price: 120.00,
      status: 'ACTIVE',
      isOriginal: true,
      lastSyncAt: new Date().toISOString()
    },
    {
      id: 'list-102-a',
      physicalItemId: 'item-phy-102',
      storeId: 'store-1',
      storeName: 'Store A (Boutique Thrift)',
      supplier: 'Store_C',
      sku: 'BSD-102',
      productId: 'prod-shp-a102',
      variantId: 'var-shp-a102-1',
      productTitle: 'Retro Oversized Denim Trucker Jacket (Shared)',
      price: 120.00,
      status: 'ACTIVE',
      isOriginal: false,
      lastSyncAt: new Date().toISOString()
    },
    {
      id: 'list-102-b',
      physicalItemId: 'item-phy-102',
      storeId: 'store-2',
      storeName: 'Store B (Retro Wear)',
      supplier: 'Store_C',
      sku: 'BSD-102',
      productId: 'prod-shp-b102',
      variantId: 'var-shp-b102-1',
      productTitle: 'Retro Oversized Denim Trucker Jacket (Shared)',
      price: 120.00,
      status: 'ACTIVE',
      isOriginal: false,
      lastSyncAt: new Date().toISOString()
    },

    // Physical Item 103 (Owner: Store B, Shared: Store A, C, D)
    {
      id: 'list-103-b',
      physicalItemId: 'item-phy-103',
      storeId: 'store-2',
      storeName: 'Store B (Retro Wear)',
      supplier: 'Store_B',
      sku: 'WBSD-105',
      productId: 'prod-shp-b103',
      variantId: 'var-shp-b103-1',
      productTitle: '70s Disco Graphic Band Tee',
      price: 95.00,
      status: 'ACTIVE',
      isOriginal: true,
      lastSyncAt: new Date().toISOString()
    },
    {
      id: 'list-103-a',
      physicalItemId: 'item-phy-103',
      storeId: 'store-1',
      storeName: 'Store A (Boutique Thrift)',
      supplier: 'Store_B',
      sku: 'WBSD-105',
      productId: 'prod-shp-a103',
      variantId: 'var-shp-a103-1',
      productTitle: '70s Disco Graphic Band Tee (Shared)',
      price: 95.00,
      status: 'ACTIVE',
      isOriginal: false,
      lastSyncAt: new Date().toISOString()
    },
    {
      id: 'list-103-c',
      physicalItemId: 'item-phy-103',
      storeId: 'store-3',
      storeName: 'Store C (Vintage Vault)',
      supplier: 'Store_B',
      sku: 'WBSD-105',
      productId: 'prod-shp-c103',
      variantId: 'var-shp-c103-1',
      productTitle: '70s Disco Graphic Band Tee (Shared)',
      price: 95.00,
      status: 'ACTIVE',
      isOriginal: false,
      lastSyncAt: new Date().toISOString()
    },

    // Physical Item 104 (SOLD item - Store A Owner, Sold by Store B, Store C drafted)
    {
      id: 'list-104-a',
      physicalItemId: 'item-phy-104',
      storeId: 'store-1',
      storeName: 'Store A (Boutique Thrift)',
      supplier: 'Store_A',
      sku: 'VINT-881',
      productId: 'prod-shp-a104',
      variantId: 'var-shp-a104-1',
      productTitle: 'Hand-Knitted Chunky Wool Sweater',
      price: 140.00,
      status: 'SOLD',
      isOriginal: true,
      lastSyncAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'list-104-b',
      physicalItemId: 'item-phy-104',
      storeId: 'store-2',
      storeName: 'Store B (Retro Wear)',
      supplier: 'Store_A',
      sku: 'VINT-881',
      productId: 'prod-shp-b104',
      variantId: 'var-shp-b104-1',
      productTitle: 'Hand-Knitted Chunky Wool Sweater (Shared)',
      price: 140.00,
      status: 'SOLD',
      isOriginal: false,
      lastSyncAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'list-104-c',
      physicalItemId: 'item-phy-104',
      storeId: 'store-3',
      storeName: 'Store C (Vintage Vault)',
      supplier: 'Store_A',
      sku: 'VINT-881',
      productId: 'prod-shp-c104',
      variantId: 'var-shp-c104-1',
      productTitle: 'Hand-Knitted Chunky Wool Sweater (Shared)',
      price: 140.00,
      status: 'DRAFT',
      isOriginal: false,
      lastSyncAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  private reservations: Reservation[] = [];

  private orders: Order[] = [
    {
      id: 'ord-cross-5501',
      physicalItemId: 'item-phy-104',
      sku: 'VINT-881',
      supplier: 'Store_A',
      originalStoreId: 'store-1',
      originalStoreName: 'Store A (Boutique Thrift)',
      sellingStoreId: 'store-2',
      sellingStoreName: 'Store B (Retro Wear)',
      sellingStoreOrderId: '#1089',
      originalStoreOrderId: '#9042',
      customerName: 'Sarah Connor',
      customerEmail: 'sarah.c@example.com',
      shippingAddress: '742 Evergreen Terrace, Springfield, OR 97477',
      itemPrice: 140.00,
      discountPercentage: 99,
      orderTag: 'Dropshipped_Order',
      soldBy: 'Store_B',
      isCrossStore: true,
      status: 'COMPLETED',
      syncStatus: 'SUCCESS',
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  private syncJobs: SyncJob[] = [
    {
      transactionId: 'txn-88129031',
      physicalItemId: 'item-phy-104',
      sku: 'VINT-881',
      supplier: 'Store_A',
      operation: 'CROSS_STORE_DROPSHIP_SYNC',
      sellingStoreId: 'store-2',
      originalStoreId: 'store-1',
      affectedStoreIds: ['store-1', 'store-2', 'store-3'],
      status: 'COMPLETED',
      retryCount: 0,
      responsePayload: JSON.stringify({
        reservationLock: 'ACQUIRED',
        internalOrder: '#9042',
        discountApplied: '99%',
        orderTagAdded: 'Dropshipped_Order',
        soldBy: 'Store_B',
        storeCDrafted: true
      }),
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  private webhooks: WebhookEvent[] = [
    {
      id: 'wh-9001',
      externalEventId: 'evt_shp_8829101',
      storeId: 'store-2',
      storeName: 'Store B (Retro Wear)',
      eventType: 'orders/create',
      payload: {
        id: '1089',
        order_number: 1089,
        email: 'sarah.c@example.com',
        customer: { first_name: 'Sarah', last_name: 'Connor', email: 'sarah.c@example.com' },
        line_items: [
          { sku: 'VINT-881', name: 'Hand-Knitted Chunky Wool Sweater (Shared)', price: '140.00', quantity: 1, custom_supplier: 'Store_A' }
        ]
      },
      verificationStatus: 'PROCESSED',
      receivedAt: new Date(Date.now() - 3600000).toISOString(),
      processedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  private auditLogs: AuditLog[] = [
    {
      id: 'aud-001',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'SyncEngine (System)',
      action: 'CROSS_STORE_SALE_COMPLETED',
      storeId: 'store-2',
      storeName: 'Store B (Retro Wear)',
      physicalItemId: 'item-phy-104',
      transactionId: 'txn-88129031',
      previousState: 'AVAILABLE',
      newState: 'SOLD',
      result: 'SUCCESS',
      details: 'Store B sold item owned by Store A. Internal order #9042 created with 99% discount & Dropshipped_Order tag. Store C listing drafted.'
    },
    {
      id: 'aud-002',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'SyncEngine (System)',
      action: 'RESERVATION_ACQUIRED',
      storeId: 'store-2',
      storeName: 'Store B (Retro Wear)',
      physicalItemId: 'item-phy-104',
      transactionId: 'txn-88129031',
      previousState: 'AVAILABLE',
      newState: 'RESERVED',
      result: 'SUCCESS',
      details: 'Atomic lock acquired for SKU VINT-881 + Store_A. Reservation created.'
    }
  ];

  private errors: SyncError[] = [];

  private notifications: Notification[] = [
    {
      id: 'notif-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      severity: 'INFO',
      title: 'Cross-Store Sale Completed',
      message: 'Store B successfully sold VINT-881 (Store A). Internal dropship order created.',
      storeId: 'store-2',
      physicalItemId: 'item-phy-104',
      read: false
    }
  ];

  // Store methods
  public getStores(): Store[] {
    return [...this.stores];
  }

  public getStoreById(id: string): Store | undefined {
    return this.stores.find(s => s.id === id);
  }

  public addStore(storeData: Omit<Store, 'id' | 'createdAt' | 'lastSyncAt' | 'productCount' | 'orderCount'>): Store {
    const newStore: Store = {
      ...storeData,
      id: `store-${Date.now()}`,
      productCount: 0,
      orderCount: 0,
      lastSyncAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    this.stores.push(newStore);

    this.logAudit({
      user: 'Admin User',
      action: 'STORE_CONNECTED',
      storeId: newStore.id,
      storeName: newStore.name,
      result: 'SUCCESS',
      details: `New store ${newStore.name} (${newStore.supplierCode}) connected successfully.`
    });

    return newStore;
  }

  public updateStoreStatus(id: string, status: Store['status']): Store | undefined {
    const store = this.stores.find(s => s.id === id);
    if (store) {
      store.status = status;
      store.lastSyncAt = new Date().toISOString();
    }
    return store;
  }

  public deleteStore(id: string): boolean {
    const idx = this.stores.findIndex(s => s.id === id);
    if (idx !== -1) {
      const removed = this.stores.splice(idx, 1)[0];
      this.logAudit({
        user: 'Admin User',
        action: 'STORE_DISCONNECTED',
        storeId: removed.id,
        storeName: removed.name,
        result: 'SUCCESS',
        details: `Store ${removed.name} was disconnected.`
      });
      return true;
    }
    return false;
  }

  // Physical Items methods
  public getPhysicalItems(): PhysicalItem[] {
    return [...this.physicalItems];
  }

  public getPhysicalItemById(id: string): PhysicalItem | undefined {
    return this.physicalItems.find(p => p.id === id);
  }

  public findPhysicalItemBySkuAndSupplier(sku: string, supplier: string): PhysicalItem | undefined {
    return this.physicalItems.find(
      p => p.sku.toLowerCase() === sku.toLowerCase() && p.supplier.toLowerCase() === supplier.toLowerCase()
    );
  }

  public createPhysicalItem(item: Omit<PhysicalItem, 'id' | 'createdAt' | 'updatedAt'>): PhysicalItem {
    const newItem: PhysicalItem = {
      ...item,
      id: `item-phy-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.physicalItems.push(newItem);

    // Also auto-create the original store listing
    this.createListing({
      physicalItemId: newItem.id,
      storeId: newItem.originalStoreId,
      storeName: newItem.originalStoreName,
      supplier: newItem.supplier,
      sku: newItem.sku,
      productId: `prod-shp-${newItem.id}`,
      variantId: `var-shp-${newItem.id}-1`,
      productTitle: newItem.title,
      price: newItem.price,
      status: 'ACTIVE',
      isOriginal: true,
      lastSyncAt: new Date().toISOString()
    });

    this.logAudit({
      user: 'Admin User',
      action: 'PHYSICAL_ITEM_CREATED',
      physicalItemId: newItem.id,
      storeId: newItem.originalStoreId,
      storeName: newItem.originalStoreName,
      result: 'SUCCESS',
      details: `Created new physical thrift item: ${newItem.title} (SKU: ${newItem.sku}, Supplier: ${newItem.supplier})`
    });

    return newItem;
  }

  public updatePhysicalItem(id: string, updates: Partial<PhysicalItem>): PhysicalItem | undefined {
    const item = this.physicalItems.find(p => p.id === id);
    if (item) {
      Object.assign(item, updates, { updatedAt: new Date().toISOString() });
    }
    return item;
  }

  // Store Listings methods
  public getListings(): StoreListing[] {
    return [...this.listings];
  }

  public getListingsByPhysicalItem(physicalItemId: string): StoreListing[] {
    return this.listings.filter(l => l.physicalItemId === physicalItemId);
  }

  public createListing(listing: Omit<StoreListing, 'id' | 'lastSyncAt'> & { lastSyncAt?: string }): StoreListing {
    const newListing: StoreListing = {
      ...listing,
      id: `list-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      lastSyncAt: listing.lastSyncAt || new Date().toISOString()
    };
    this.listings.push(newListing);
    return newListing;
  }

  public updateListingStatus(listingId: string, status: StoreListing['status']): StoreListing | undefined {
    const listing = this.listings.find(l => l.id === listingId);
    if (listing) {
      listing.status = status;
      listing.lastSyncAt = new Date().toISOString();
    }
    return listing;
  }

  public shareProductWithStore(physicalItemId: string, targetStoreId: string): StoreListing | null {
    const item = this.getPhysicalItemById(physicalItemId);
    const targetStore = this.getStoreById(targetStoreId);

    if (!item || !targetStore) return null;

    // Check if listing already exists
    const existing = this.listings.find(l => l.physicalItemId === physicalItemId && l.storeId === targetStoreId);
    if (existing) {
      existing.status = 'ACTIVE';
      existing.lastSyncAt = new Date().toISOString();
      return existing;
    }

    const newListing = this.createListing({
      physicalItemId: item.id,
      storeId: targetStore.id,
      storeName: targetStore.name,
      supplier: item.supplier, // IMPORTANT: Must retain original custom.supplier
      sku: item.sku,
      productId: `prod-shp-${targetStore.supplierCode.toLowerCase()}-${item.sku.toLowerCase()}`,
      variantId: `var-shp-${targetStore.supplierCode.toLowerCase()}-${item.sku.toLowerCase()}-1`,
      productTitle: `${item.title} (Shared)`,
      price: item.price,
      status: item.status === 'AVAILABLE' ? 'ACTIVE' : 'DRAFT',
      isOriginal: false
    });

    item.sharingStatus = 'SHARED';
    item.updatedAt = new Date().toISOString();

    this.logAudit({
      user: 'Admin User',
      action: 'PRODUCT_SHARED',
      physicalItemId: item.id,
      storeId: targetStore.id,
      storeName: targetStore.name,
      result: 'SUCCESS',
      details: `Shared product ${item.sku} (${item.supplier}) with ${targetStore.name}`
    });

    return newListing;
  }

  public unshareProductFromStore(physicalItemId: string, targetStoreId: string): boolean {
    const listingIdx = this.listings.findIndex(l => l.physicalItemId === physicalItemId && l.storeId === targetStoreId && !l.isOriginal);
    if (listingIdx !== -1) {
      const removed = this.listings.splice(listingIdx, 1)[0];
      
      const item = this.getPhysicalItemById(physicalItemId);
      if (item) {
        const remainingShared = this.listings.filter(l => l.physicalItemId === physicalItemId && !l.isOriginal);
        if (remainingShared.length === 0) {
          item.sharingStatus = 'NOT_SHARED';
        }
      }

      this.logAudit({
        user: 'Admin User',
        action: 'PRODUCT_UNSHARED',
        physicalItemId,
        storeId: targetStoreId,
        result: 'SUCCESS',
        details: `Unshared listing ${removed.sku} from store ${removed.storeName}`
      });
      return true;
    }
    return false;
  }

  // Reservations methods
  public getReservations(): Reservation[] {
    return [...this.reservations];
  }

  public getActiveReservation(physicalItemId: string): Reservation | undefined {
    return this.reservations.find(r => r.physicalItemId === physicalItemId && r.status === 'ACTIVE');
  }

  public createReservation(resData: Omit<Reservation, 'id' | 'status' | 'lockedAt' | 'expiresAt'>, ttlMinutes = 15): Reservation {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlMinutes * 60000).toISOString();

    const reservation: Reservation = {
      ...resData,
      id: `res-${Date.now()}`,
      status: 'ACTIVE',
      lockedAt: now.toISOString(),
      expiresAt
    };

    this.reservations.push(reservation);

    // Update physical item
    const item = this.getPhysicalItemById(resData.physicalItemId);
    if (item) {
      item.availableQuantity = 0;
      item.reservedQuantity = 1;
      item.status = 'RESERVED';
      item.currentSellingStoreId = resData.sellingStoreId;
      item.currentSellingStoreName = resData.sellingStoreName;
      item.activeReservationId = reservation.id;
      item.updatedAt = now.toISOString();
    }

    this.logAudit({
      user: 'SyncEngine (Atomic Lock)',
      action: 'RESERVATION_CREATED',
      physicalItemId: resData.physicalItemId,
      storeId: resData.sellingStoreId,
      storeName: resData.sellingStoreName,
      result: 'SUCCESS',
      details: `Lock acquired for SKU ${resData.sku} (${resData.supplier}). Customer: ${resData.customerName}`
    });

    return reservation;
  }

  public releaseReservation(reservationId: string, reason = 'Manual admin release'): boolean {
    const res = this.reservations.find(r => r.id === reservationId && r.status === 'ACTIVE');
    if (!res) return false;

    res.status = 'RELEASED';
    res.releasedAt = new Date().toISOString();
    res.releaseReason = reason;

    const item = this.getPhysicalItemById(res.physicalItemId);
    if (item && item.status === 'RESERVED') {
      item.availableQuantity = 1;
      item.reservedQuantity = 0;
      item.status = 'AVAILABLE';
      item.currentSellingStoreId = undefined;
      item.currentSellingStoreName = undefined;
      item.activeReservationId = undefined;
      item.updatedAt = new Date().toISOString();

      // Restore listings status if appropriate
      const listings = this.getListingsByPhysicalItem(item.id);
      listings.forEach(l => {
        if (l.status !== 'DRAFT') {
          l.status = 'ACTIVE';
        }
      });
    }

    this.logAudit({
      user: 'Admin / System',
      action: 'RESERVATION_RELEASED',
      physicalItemId: res.physicalItemId,
      storeId: res.sellingStoreId,
      result: 'SUCCESS',
      details: `Released reservation ${reservationId}. Reason: ${reason}. Item is now AVAILABLE.`
    });

    return true;
  }

  // Orders methods
  public getOrders(): Order[] {
    return [...this.orders];
  }

  public getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'createdAt'>): Order {
    const newOrder: Order = {
      ...orderData,
      id: `ord-cross-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    this.orders.unshift(newOrder);

    // Update physical item to SOLD state
    const item = this.getPhysicalItemById(orderData.physicalItemId);
    if (item) {
      item.availableQuantity = 0;
      item.reservedQuantity = 0;
      item.status = 'SOLD';
      item.currentSellingStoreId = orderData.sellingStoreId;
      item.currentSellingStoreName = orderData.sellingStoreName;
      item.soldOrderId = newOrder.id;
      item.updatedAt = new Date().toISOString();
    }

    this.logAudit({
      user: 'SyncEngine (Order Sync)',
      action: 'ORDER_CREATED',
      physicalItemId: orderData.physicalItemId,
      storeId: orderData.originalStoreId,
      storeName: orderData.originalStoreName,
      result: 'SUCCESS',
      details: `Created internal order on ${orderData.originalStoreName} with 99% discount & Dropshipped_Order tag. Customer: ${orderData.customerName}. Sold by: ${orderData.soldBy}`
    });

    return newOrder;
  }

  // Sync Jobs methods
  public getSyncJobs(): SyncJob[] {
    return [...this.syncJobs];
  }

  public addSyncJob(job: Omit<SyncJob, 'transactionId' | 'createdAt' | 'updatedAt'>): SyncJob {
    const newJob: SyncJob = {
      ...job,
      transactionId: `txn-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.syncJobs.unshift(newJob);
    return newJob;
  }

  public updateSyncJobStatus(transactionId: string, status: SyncJob['status'], errorMessage?: string, responsePayload?: string): SyncJob | undefined {
    const job = this.syncJobs.find(j => j.transactionId === transactionId);
    if (job) {
      job.status = status;
      if (errorMessage) job.errorMessage = errorMessage;
      if (responsePayload) job.responsePayload = responsePayload;
      job.updatedAt = new Date().toISOString();
    }
    return job;
  }

  // Webhooks methods
  public getWebhooks(): WebhookEvent[] {
    return [...this.webhooks];
  }

  public recordWebhook(webhook: Omit<WebhookEvent, 'id' | 'receivedAt'>): WebhookEvent {
    const newWh: WebhookEvent = {
      ...webhook,
      id: `wh-${Date.now()}`,
      receivedAt: new Date().toISOString()
    };
    this.webhooks.unshift(newWh);
    return newWh;
  }

  public isWebhookProcessed(externalEventId: string): boolean {
    return this.webhooks.some(w => w.externalEventId === externalEventId && w.verificationStatus === 'PROCESSED');
  }

  // Audit Logs methods
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  public logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(newLog);
    return newLog;
  }

  // Errors methods
  public getErrors(): SyncError[] {
    return [...this.errors];
  }

  public recordError(errorData: Omit<SyncError, 'id' | 'timestamp' | 'status'>): SyncError {
    const newErr: SyncError = {
      ...errorData,
      id: `err-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'UNRESOLVED'
    };
    this.errors.unshift(newErr);

    this.addNotification({
      severity: 'CRITICAL',
      title: `Sync Failure on ${errorData.storeName}`,
      message: `Operation: ${errorData.operation} failed for SKU ${errorData.sku}. ${errorData.errorMessage}`,
      storeId: errorData.storeId,
      physicalItemId: errorData.physicalItemId
    });

    return newErr;
  }

  public resolveError(errorId: string): boolean {
    const err = this.errors.find(e => e.id === errorId);
    if (err) {
      err.status = 'RESOLVED';
      this.logAudit({
        user: 'Admin User',
        action: 'ERROR_RESOLVED',
        result: 'SUCCESS',
        details: `Resolved error ${errorId} for SKU ${err.sku}`
      });
      return true;
    }
    return false;
  }

  // Notifications methods
  public getNotifications(): Notification[] {
    return [...this.notifications];
  }

  public addNotification(notif: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    this.notifications.unshift(newNotif);
    return newNotif;
  }

  public markNotificationAsRead(id: string): void {
    const n = this.notifications.find(x => x.id === id);
    if (n) n.read = true;
  }

  // Dashboard Metrics calculation
  public getMetrics(): DashboardMetrics {
    return {
      totalStores: this.stores.length,
      connectedStores: this.stores.filter(s => s.status === 'CONNECTED').length,
      sharedProducts: this.physicalItems.filter(p => p.sharingStatus === 'SHARED').length,
      availableSharedInventory: this.physicalItems.filter(p => p.sharingStatus === 'SHARED' && p.status === 'AVAILABLE').length,
      reservedInventory: this.physicalItems.filter(p => p.status === 'RESERVED').length,
      soldInventory: this.physicalItems.filter(p => p.status === 'SOLD').length,
      pendingSyncs: this.syncJobs.filter(j => j.status === 'PENDING' || j.status === 'PROCESSING').length,
      failedSyncs: this.errors.filter(e => e.status === 'UNRESOLVED').length,
      recentOrdersCount: this.orders.length,
      activeReservationsCount: this.reservations.filter(r => r.status === 'ACTIVE').length
    };
  }

  // Demo Reset function
  public resetToDefaultDemoState(): void {
    // Re-initialize arrays with default state
    const fresh = new ThriftSyncDataStore();
    this.stores = fresh.stores;
    this.physicalItems = fresh.physicalItems;
    this.listings = fresh.listings;
    this.reservations = fresh.reservations;
    this.orders = fresh.orders;
    this.syncJobs = fresh.syncJobs;
    this.webhooks = fresh.webhooks;
    this.auditLogs = fresh.auditLogs;
    this.errors = fresh.errors;
    this.notifications = fresh.notifications;
  }
}

// Global Singleton Instance
export const storeData = new ThriftSyncDataStore();
