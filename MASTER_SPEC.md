# ThriftSync
## Multi-Store Thrift Inventory Sync, Reservation & Dropship Order Platform Shopify

Shopify Stores A, B, C, D ....
connected via Shopify API Token  shpca_XXXXXX and Store link notification webhook secret to get notification of place order from other stores. when order is placed on any store it shoudl be reflected on all other stores in real time and the product should be reserved for the customer who placed the order on that store. and the product should be marked as sold on all other stores. if the order is cancelled on the original store it shoudl be reflected on all other stores and the product should be made available for sale on all other stores. also seller order place on actual store owner store if the order is placed on any store it shoudl be reflected on all other stores in real time and the product should be reserved for the customer who placed the order on that store. and the product should be marked as sold on all other stores. if the order is cancelled on the original store it shoudl be reflected on all other stores and the product should be made available for sale on all other stores. also seller 

for placeing dropshipping order 
each store share Name, Email, Address, phone, and Other information for placing order on other stores. the order will be placed on the original store and the original store will be responsible for the order. 
the product will be shipped from the original store to the seller store and the seller store will be responsible for the final delivery to the customer. 

## 1. Project Overview

Build a web application called **ThriftSync** for managing shared inventory across multiple independent thrift clothing stores.

Main purpose:

- Multiple thrift stores share selected products.
- Each store keeps its own Shopify inventory.
- Shared products can be sold through another connected store.
- Thrift products are normally one-piece inventory.
- When one physical item sells through any connected store, all other representations of that same shared inventory must immediately become unavailable.
- Application must prevent overselling.
- Application must maintain complete ownership, reservation, order, synchronization, and audit history.

Primary business rule:

> **One physical thrift item = one available sale.**

The application must support 2 or more stores without being hard-coded for a fixed number of stores.

---

# 2. Core Concept

Example stores:

- Store A
- Store B
- Store C

Each store owns its own inventory.

Stores can explicitly share selected products with other stores.

A product can therefore have:

- Original/owner store
- Shared/selling stores
- Product listing in multiple stores
- One physical inventory identity
- One reservation state
- One final sold state

The system must treat the physical item as the source of truth.

---

# 3. Product Identification

SKU alone must NEVER be treated as sufficient product authentication.

Use:

```text
SKU + custom.supplier
```

as the store-level product identity.

Example:

### Store A

```text
SKU: BSD-102
custom.supplier: Store_A
```

### Store B

```text
SKU: WBSD-105
custom.supplier: Store_B
```

### Store C

```text
SKU: BSD-102
custom.supplier: Store_C
```

Store A and Store C have the same SKU but different suppliers.

Therefore:

```text
BSD-102 + Store_A
```

and

```text
BSD-102 + Store_C
```

are different store-owned product identities.

However, they can still be explicitly linked through the application's shared-inventory relationship if they represent the same physical item.

---

# 4. Physical Item Identity

The application must maintain a separate internal identity for each physical thrift item.

Do NOT assume that:

```text
same SKU = same physical item
```

Instead, the application must support an explicit shared-inventory relationship.

Conceptually:

```text
Physical Item
    |
    +-- Original Store
    |
    +-- SKU
    |
    +-- Supplier
    |
    +-- Store Listings
    |
    +-- Reservations
    |
    +-- Orders
    |
    +-- Sold Status
```

A physical item may have multiple store listings but only one available physical quantity.

---

# 5. Shared Inventory

Each store can share selected products with other connected stores.

Store owner must be able to:

- Share product
- Stop sharing product
- View shared products
- View products shared by other stores
- View original owner
- View current selling store
- View reservation
- View sale status

Possible statuses:

```text
Not Shared
Shared
Reserved
Sold
Unavailable
Sync Error
```

---

# 6. Multi-Store Architecture

Do NOT hard-code:

```text
Store A
Store B
Store C
```

as fixed application fields.

Store count must be dynamic.

Application must support:

- 2 stores
- 3 stores
- 5 stores
- 10+ stores

without changing application architecture.

Any connected store can be:

- Original inventory owner
- Selling store
- Sharing store
- Receiving store

---

# 7. Store Management

Admin must be able to:

- Add store
- Connect store
- Disconnect store
- Rename store
- View store status
- Configure sharing
- View store inventory
- View store orders
- View synchronization history
- View store errors

Each store must remain logically isolated.

One store must never accidentally modify unrelated inventory belonging to another store.

---

# 8. Inventory Data

For every shared product, maintain at minimum:

```text
Physical Item ID
Original Store ID
Selling Store ID
SKU
Supplier
Product ID
Variant ID
Available Quantity
Reserved Quantity
Sharing Status
Reservation Status
Sold Status
Created At
Updated At
```

Optional useful fields:

```text
Product Title
Product Handle
Product Image
Store Listing IDs
Reservation ID
Original Order ID
Selling Store Order ID
Sync Status
Last Sync Time
```

---

# 9. Quantity Rules

Thrift inventory normally has quantity:

```text
1
```

The application must support quantity 1 as the primary business case.

When item becomes reserved:

```text
Available = 0
Reserved = 1
```

When sale completes:

```text
Available = 0
Reserved = 0
Sold = true
```

When reservation is safely cancelled:

```text
Available = 1
Reserved = 0
Sold = false
```

Never allow negative inventory.

---

# 10. Reservation System

Reservation must happen before final sale synchronization.

When one store receives a sale:

1. Lock shared inventory.
2. Check current reservation/sold status.
3. Reject if already reserved or sold.
4. Mark item as reserved.
5. Identify original owner.
6. Identify all linked store listings.
7. Start synchronization.
8. Make corresponding listings unavailable.
9. Process required cross-store order.
10. Mark item sold after successful completion.
11. Save complete audit history.

---

# 11. Race Condition Protection

Two stores may receive sales for the same physical item at nearly the same time.

Application must prevent both sales from succeeding.

Example:

```text
Store B receives sale
Store C receives sale
```

for same physical item.

Only one transaction may acquire reservation lock.

Expected behavior:

```text
Store B -> Reservation acquired
Store C -> Reservation rejected
```

or:

```text
Store C -> Reservation acquired
Store B -> Reservation rejected
```

depending on which transaction successfully locks first.

Do NOT rely only on frontend checks.

Reservation locking must happen server-side and atomically.

---

# 12. Cross-Store Sale

Important workflow.

Example:

Store A owns:

```text
SKU: BSD-102
Supplier: Store_A
Quantity: 1
```

Store A shares this physical item with Store B and Store C.

Customer buys the item from Store B.

Store B is the selling store.

Store A is the original owner.

Application must:

1. Receive Store B sale event.
2. Identify physical item.
3. Verify SKU.
4. Verify `custom.supplier`.
5. Verify explicit shared-inventory relationship.
6. Acquire reservation lock.
7. Reserve physical item.
8. Identify Store A as original owner.
9. Identify Store B as selling store.
10. Identify other connected listings such as Store C.
11. Create corresponding order on Store A.
12. Use Store B customer information on Store A order.
13. Apply 99% discount to the Store A order.
14. Add order tag `Dropshipped_Order`.
15. Preserve original selling information.
16. Draft/unpublish the corresponding product from Store C.
17. Make all other linked listings unavailable.
18. Record complete transaction.
19. Mark physical item sold after successful synchronization.

---

# 13. Cross-Store Order Creation

When Store B sells an item owned by Store A, create corresponding order on Store A.

Example:

```text
Selling Store:
Store_B

Original Store:
Store_A

SKU:
BSD-102

Supplier:
Store_A
```

The Store A order must use the customer information from Store B.

Customer information to transfer:

```text
Customer Name
Customer Email
Customer Shipping Information
Customer Contact Information
```

Use Store B customer name and email when creating the Store A order.

---

# 14. 99% Discount Rule

Cross-store order created on original store must use a:

```text
99% discount
```

Reason:

Avoid inaccurate sales figures and avoid treating internal dropship synchronization as a normal full-price sale.

The system must clearly record that this is an internal cross-store/dropship order.

Example:

```text
Original Sale:
Store B

Internal Order:
Store A

Discount:
99%

Order Type:
Dropshipped Order
```

The 99% discount must not change the original customer's actual selling price/order in Store B.

It applies only to the internal synchronized order created on the original store.

---

# 15. Order Tag

Every internal cross-store order must contain:

```text
Dropshipped_Order
```

Use exact spelling:

```text
Dropshipped_Order
```

Do not replace it with a different tag.

This tag allows internal orders to be identified separately from normal customer orders.

---

# 16. Selling Store Identification

The original store order must clearly record the selling store.

Example:

```text
Sold by: Store_B
```

The application should preserve this information in the order where supported.

Also maintain it inside the application's own database as the authoritative transaction record.

Recommended internal fields:

```text
selling_store_id
selling_store_name
original_store_id
original_store_name
```

---

# 17. Example: Store B Sells Store A Product

Physical item:

```text
SKU: BSD-102
Supplier: Store_A
Owner: Store_A
Quantity: 1
```

Shared with:

```text
Store_B
Store_C
```

Store B customer purchases item.

Application flow:

```text
Store B Sale
      |
      v
Identify BSD-102 + Store_A
      |
      v
Find Physical Item
      |
      v
Acquire Reservation Lock
      |
      v
Reserve Item
      |
      v
Create Order on Store A
      |
      +--> Customer Name = Store B customer
      |
      +--> Customer Email = Store B customer
      |
      +--> Discount = 99%
      |
      +--> Tag = Dropshipped_Order
      |
      +--> Sold by = Store_B
      |
      v
Draft/disable Store C listing
      |
      v
Disable other shared listings
      |
      v
Mark physical item Sold
      |
      v
Write Audit Log
```

---

# 18. Draft Product From Other Stores

When Store B sells:

```text
BSD-102 + Store_A
```

and Store C has the corresponding shared representation, application must draft or otherwise make unavailable the Store C product.

Expected result:

```text
Store A:
Sold / unavailable

Store B:
Sold / order completed

Store C:
Draft / unavailable
```

Exact product matching must use:

```text
Physical Item ID
```

and store-specific product identity.

Do not draft products based only on SKU.

---

# 19. Reverse Scenario

Store C may sell its own physical product:

```text
SKU: BSD-102
Supplier: Store_C
```

If this product is explicitly linked to shared inventory across Store A and Store B, application must:

1. Receive Store C sale.
2. Acquire reservation lock.
3. Verify physical item relationship.
4. Reserve item.
5. Identify all connected listings.
6. Make Store A listing unavailable.
7. Make Store B listing unavailable.
8. Complete Store C sale.
9. Mark physical item sold.
10. Record complete audit history.

---

# 20. Important Matching Rule

The application must use three levels of verification.

### Level 1: SKU

Example:

```text
BSD-102
```

### Level 2: Supplier

Example:

```text
custom.supplier = Store_A
```

### Level 3: Explicit Shared Physical Item Relationship

The final decision must use:

```text
SKU
+
custom.supplier
+
Physical Item / Shared Inventory Relationship
```

This prevents accidental synchronization of unrelated thrift products.

---

# 21. Order Tracking

Every synchronized transaction must record:

```text
Transaction ID
Physical Item ID
Selling Store
Original Store
SKU
Supplier
Product ID
Variant ID
Selling Store Order ID
Original Store Order ID
Customer Name
Customer Email
Discount
Order Tag
Reservation Timestamp
Sale Timestamp
Sync Status
Error Status
Retry Count
Created At
Updated At
```

---

# 22. Transaction Status

Use clear states:

```text
Pending
Processing
Reserved
Order Created
Listings Updating
Completed
Failed
Retrying
Cancelled
Released
Sold
```

A transaction must not be shown as completed when required synchronization failed.

---

# 23. Sync Engine

Inventory synchronization must run automatically.

When product availability changes:

1. Detect change.
2. Identify physical item.
3. Validate store ownership.
4. Validate SKU.
5. Validate supplier.
6. Validate shared relationship.
7. Acquire reservation lock.
8. Update inventory state.
9. Update connected listings.
10. Create required internal order.
11. Record result.
12. Retry failures where safe.

---

# 24. Failed Synchronization

Never silently ignore synchronization failure.

For every failure, store:

```text
Timestamp
Store
Operation
Physical Item
SKU
Supplier
Product ID
Variant ID
Order ID
Error Message
Retry Count
Status
```

Admin must be able to retry failed operations.

---

# 25. Retry Safety

Retries must be idempotent.

If an operation already succeeded, retry must not:

- Create duplicate order
- Create duplicate reservation
- Duplicate inventory reduction
- Duplicate customer
- Duplicate transaction
- Sell same product twice

Use internal transaction IDs and idempotency checks.

---

# 26. Webhook/Event Handling

Application should react to store events such as:

- New order
- Order cancellation
- Order update
- Product update
- Inventory update
- Product deletion
- Product status change

Events must be verified before processing.

Duplicate events must not create duplicate actions.

---

# 27. Order Cancellation

If a selling-store order is cancelled before final sale completion:

1. Check physical item status.
2. Check whether item has already been sold elsewhere.
3. Release reservation only if safe.
4. Restore availability where appropriate.
5. Restore shared listings where appropriate.
6. Record cancellation.
7. Update audit history.

Never restore inventory if another valid sale already acquired the physical item.

---

# 28. Dashboard

Main dashboard should show:

```text
Total Stores
Connected Stores
Shared Products
Available Shared Inventory
Reserved Inventory
Sold Inventory
Pending Syncs
Failed Syncs
Recent Orders
Recent Reservations
```

Use operational focus.

Admin should immediately see problems requiring action.

---

# 29. Shared Inventory Page

Show:

```text
Physical Item
SKU
Supplier
Original Store
Shared Stores
Current Status
Available Quantity
Reservation
Selling Store
Order
Last Sync
```

Filters:

```text
Store
SKU
Supplier
Status
Selling Store
Original Store
Date
```

---

# 30. Reservation Page

Show:

```text
Reservation ID
Physical Item
SKU
Original Store
Selling Store
Customer
Created Time
Expiration
Status
Order
Sync Status
```

Allow authorized admin to inspect reservation details.

---

# 31. Orders Page

Show:

```text
Order ID
Selling Store
Original Store
Customer
SKU
Supplier
Discount
Order Tag
Status
Created Time
Sync Status
```

Clearly distinguish normal orders from:

```text
Dropshipped_Order
```

---

# 32. Sync History

Show every synchronization operation.

Fields:

```text
Timestamp
Transaction ID
Store
Operation
Product
SKU
Status
Response
Error
Retry Count
```

Allow filtering and searching.

---

# 33. Error Management

Dedicated errors page.

Show:

```text
Critical Errors
Failed Orders
Failed Inventory Updates
Failed Product Updates
Webhook Errors
Authentication Errors
Connection Errors
```

Each error should provide enough information to diagnose issue.

Allow safe retry.

---

# 34. Audit Log

Maintain immutable-style audit history for important actions.

Track:

- Product shared
- Product unshared
- Reservation created
- Reservation released
- Order created
- Order synchronized
- Product drafted
- Inventory changed
- Sale completed
- Sync failed
- Sync retried
- Store connected
- Store disconnected
- Manual admin action

Each audit event should contain:

```text
Timestamp
User
Action
Store
Physical Item
Transaction
Previous State
New State
Result
```

---

# 35. Authentication

Application must have secure authentication.

Only authorized users can:

- View stores
- Connect stores
- Change sharing
- View orders
- Manage reservations
- Retry synchronization
- Change settings
- Perform administrative actions

Use role-based permissions where appropriate.

Possible roles:

```text
Admin
Manager
Viewer
```

Admin has full control.

Manager can manage operational workflows.

Viewer can inspect data without changing it.

---

# 36. Security

Never expose:

- Store access tokens
- API credentials
- Client secrets
- Database credentials
- Webhook secrets
- Authentication secrets

Sensitive credentials must remain server-side.

Frontend must never receive private credentials.

All sensitive operations must happen through secure server-side endpoints.

Validate authorization on every protected operation.

Never trust store ID, product ID, order ID, or user ID supplied by frontend without server-side authorization checks.

---

# 37. Environment Variables

Application must use environment variables for secrets and deployment configuration.

Sensitive `.env` files must never be committed to Git.

Repository must include appropriate ignore rules for:

```text
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

A safe example configuration file may be provided without real secrets.

Example:

```text
DATABASE_URL=
AUTH_SECRET=
APP_URL=
WEBHOOK_SECRET=
```

Real values must only exist in secure deployment configuration.

---

# 38. Git Repository

Application must be suitable for Git repository deployment.

Repository must contain:

```text
Source Code
README
MASTER_SPEC.md
Environment Example
Git Ignore Configuration
Database Schema/Migrations
Deployment Documentation
```

Never commit:

```text
.env
Private credentials
Access tokens
API secrets
Database passwords
Webhook secrets
Private certificates
```

---

# 39. Vercel Deployment

Application must be compatible with Vercel hosting.

Deployment flow:

```text
Developer
   |
   v
Git Repository
   |
   v
Vercel Project
   |
   v
Production Deployment
```

Environment variables must be configured securely in deployment settings.

Application must not depend on secrets committed to repository.

Production configuration must be separated from development configuration.

---

# 40. Server-Side Security

Any operation involving:

- Store credentials
- Orders
- Inventory
- Reservations
- Product changes
- Customer data
- Webhooks

must execute server-side.

Frontend should request authorized operations from server-side application logic.

Never put private store credentials in browser-side code.

---

# 41. Customer Data

Store customer information securely.

Required customer information for cross-store internal order:

```text
Customer Name
Customer Email
Shipping Information
Contact Information
```

Only transfer required information.

Do not expose customer information to unauthorized users.

---

# 42. Data Consistency

Physical item state must remain consistent.

Example valid lifecycle:

```text
Available
   |
   v
Reserved
   |
   v
Sold
```

Possible cancellation:

```text
Available
   |
   v
Reserved
   |
   v
Released
   |
   v
Available
```

Invalid:

```text
Sold -> Available
```

unless a valid cancellation/return workflow explicitly confirms that item can be resold.

---

# 43. Product Availability

When physical item becomes reserved or sold, connected store listings must not remain purchasable.

Possible actions depending on store configuration:

```text
Draft product
Set unavailable
Set inventory to zero
Disable selling channel
```

Application must use the safest available mechanism supported by store integration.

Goal remains:

```text
No duplicate sale.
```

---

# 44. Return Handling

Design system so future return workflow can be added.

A returned item should not automatically become available until authorized process confirms:

- Item physically returned
- Condition verified
- Inventory restored
- Shared relationship restored if appropriate

Possible future status:

```text
Returned
Inspection
Restocked
Available
```

---

# 45. Manual Override

Admin may need manual intervention.

Provide controlled manual actions such as:

```text
Release Reservation
Retry Sync
Mark Sync Resolved
Draft Listing
Restore Listing
Mark Sold
Mark Available
```

Dangerous manual actions must require confirmation.

Every manual action must be audited.

---

# 46. Sync Conflict Handling

If two stores report conflicting inventory states:

Do not automatically choose one blindly.

System should:

1. Lock affected physical item.
2. Record conflict.
3. Stop further unsafe synchronization.
4. Show conflict to admin.
5. Provide enough information to resolve it.
6. Resume synchronization after resolution.

---

# 47. Store Connection Status

Show:

```text
Connected
Disconnected
Authentication Error
Syncing
Sync Error
Webhook Error
```

Store connection health should be visible from dashboard.

---

# 48. Operational Notifications

Provide notification system for important events:

- Reservation conflict
- Failed order creation
- Failed inventory synchronization
- Store authentication failure
- Webhook failure
- Duplicate sale attempt
- Sync conflict

Notifications should identify:

```text
Store
SKU
Supplier
Physical Item
Order
Error
```

---

# 49. Search

Global search should support:

```text
SKU
Supplier
Physical Item ID
Order Number
Customer Email
Store
Transaction ID
```

Search must not reveal data user is not authorized to view.

---

# 50. Store A / Store B / Store C Full Example

### Initial State

Store A:

```text
SKU: BSD-102
Supplier: Store_A
Quantity: 1
```

Store B displays shared representation.

Store C displays shared representation.

All listings represent same physical item through explicit shared relationship.

### Store B Sale

Customer buys from Store B.

System:

```text
1. Receive order event.
2. Identify shared item.
3. Verify SKU.
4. Verify supplier.
5. Verify physical item relationship.
6. Acquire lock.
7. Reserve item.
8. Identify Store A as owner.
9. Identify Store B as seller.
10. Create internal order on Store A.
11. Customer name = Store B customer.
12. Customer email = Store B customer.
13. Apply 99% discount.
14. Add Dropshipped_Order tag.
15. Record Sold by = Store_B.
16. Draft/unpublish Store C listing.
17. Make all other linked listings unavailable.
18. Complete synchronization.
19. Mark physical item sold.
20. Write audit records.
```

### Final State

```text
Physical Item:
Sold

Store A:
Internal dropship order created
Product unavailable

Store B:
Original customer sale completed

Store C:
Product drafted/unavailable
```

---

# 51. Second Example

Store C sells:

```text
BSD-102 + Store_C
```

If explicitly linked to same physical item:

```text
Store C -> Sale
Store A -> unavailable
Store B -> unavailable
```

No duplicate sale allowed.

---

# 52. Do Not Use Store Inventory Alone As Source of Truth

Each store's inventory system is important, but shared physical-item state must be tracked centrally.

Central application must know:

```text
Physical Item
Owner
Listings
Reservation
Sale
```

This prevents one store's inventory update from accidentally being interpreted as ownership transfer.

---

# 53. Database Requirements

Database must support relationships for:

```text
Users
Stores
Store Connections
Products
Variants
Physical Items
Shared Inventory Links
Reservations
Orders
Order Mappings
Sync Jobs
Sync Attempts
Webhook Events
Audit Logs
Errors
Notifications
```

Important relationships:

```text
Store -> Products
Physical Item -> Multiple Store Listings
Physical Item -> Reservation
Physical Item -> Orders
Physical Item -> Audit Events
Store -> Orders
Store -> Sync Jobs
```

---

# 54. Idempotency

Every external event must be processed idempotently.

Example:

Same order webhook arrives twice.

Expected:

```text
First event -> Processed
Second event -> Recognized as duplicate
No duplicate order
No duplicate reservation
No duplicate inventory reduction
```

Store external event ID where available.

---

# 55. Webhook Security

Incoming webhook requests must be authenticated and verified.

Invalid webhook requests must be rejected.

Do not process unverified inventory/order events.

Record webhook processing status.

Possible states:

```text
Received
Verified
Processing
Processed
Duplicate
Rejected
Failed
```

---

# 56. Performance

Application must be designed for multiple stores and large thrift catalogs.

Avoid loading entire inventory into frontend.

Use:

- Pagination
- Server-side filtering
- Search
- Efficient queries
- Background synchronization
- Queued jobs where appropriate
- Retry handling

Dashboard should remain usable as data grows.

---

# 57. User Interface Principles

Keep interface clean and operational.

Prioritize:

```text
Inventory Status
Reservation Status
Order Status
Sync Status
Errors
```

Use clear visual distinction for:

```text
Available
Reserved
Sold
Failed
Pending
```

Do not overload interface with unnecessary features.

---

# 58. Main Navigation

Use:

```text
Dashboard
Stores
Shared Inventory
Reservations
Orders
Sync History
Errors
Audit Log
Settings
```

---

# 59. Dashboard Quick Actions

Useful actions:

```text
Add Store
View Shared Inventory
View Active Reservations
View Failed Syncs
View Recent Orders
Retry Failed Sync
```

---

# 60. Settings

Settings should include:

```text
Store Connections
Synchronization Settings
Reservation Settings
Notification Settings
User Management
Security
Environment/Deployment Information
```

Never display secret credentials in readable form.

---

# 61. Business Rules Summary

Rule 1:

```text
SKU alone is not enough.
```

Rule 2:

```text
SKU + custom.supplier identifies store-level product identity.
```

Rule 3:

```text
Physical Item ID identifies shared physical inventory.
```

Rule 4:

```text
Explicit shared relationship is required before cross-store synchronization.
```

Rule 5:

```text
One physical thrift item can only have one successful sale.
```

Rule 6:

```text
Reservation must happen before cross-store synchronization.
```

Rule 7:

```text
Reservation must be atomic.
```

Rule 8:

```text
Cross-store internal order uses customer name and email from selling store.
```

Rule 9:

```text
Cross-store internal order uses 99% discount.
```

Rule 10:

```text
Cross-store internal order receives exact tag:
Dropshipped_Order
```

Rule 11:

```text
Original order must identify selling store.
```

Rule 12:

```text
Other linked store listings must become unavailable after successful sale.
```

Rule 13:

```text
Never expose secrets in frontend.
```

Rule 14:

```text
Never commit .env files to Git.
```

Rule 15:

```text
Application must be deployable through Git to Vercel.
```

---

# 62. Acceptance Criteria

Application is considered complete only when all following work correctly.

### Store Management

- Can connect 2+ stores.
- Can add additional stores without code changes.
- Can disconnect stores safely.
- Store status is visible.

### Product Matching

- SKU is checked.
- `custom.supplier` is checked.
- Explicit physical-item relationship is checked.
- Same SKU with different supplier is not automatically treated as same product.

### Sharing

- Products can be shared.
- Products can be unshared.
- Shared relationship is visible.

### Reservation

- Sale acquires reservation.
- Two simultaneous sales cannot both succeed.
- Reservation state is stored.
- Reservation can be safely released.

### Cross-Store Order

When Store B sells Store A product:

- Order is created on Store A.
- Store B customer name is used.
- Store B customer email is used.
- Order receives 99% discount.
- Order receives exact tag `Dropshipped_Order`.
- Selling store is recorded as Store B.
- Original store remains Store A.

### Inventory Protection

- Store C listing becomes unavailable.
- Other linked listings become unavailable.
- Physical item cannot be sold again.
- Duplicate webhook does not create duplicate sale.

### Error Handling

- Failed sync is visible.
- Error is logged.
- Retry is available.
- Successful operations are not duplicated during retry.

### Security

- Secrets remain server-side.
- `.env` is excluded from Git.
- Frontend does not expose private credentials.
- Protected actions require authorization.

### Deployment

- Repository can deploy to Vercel.
- Production environment variables can be configured securely.
- No secret values are committed to Git.

---

# 63. Development Priority

Build in this order:

```text
1. Authentication
2. Store management
3. Product synchronization
4. Physical item model
5. Shared inventory relationship
6. Reservation locking
7. Order synchronization
8. 99% cross-store order flow
9. Dropshipped_Order tagging
10. Draft/unavailable linked products
11. Webhooks
12. Retry/idempotency
13. Dashboard
14. Error management
15. Audit log
16. Notifications
17. Production hardening
18. Vercel deployment
```

Do not build UI-only mock workflows.

Core business logic must work end-to-end.

---

# 64. Final Product Goal

Build **ThriftSync** as a reliable multi-store shared thrift inventory platform.

The application must solve one core problem:

> Multiple thrift stores can sell shared physical inventory without overselling the same one-piece item.

Example:

```text
Store A owns physical item
        |
        +---- Store B sells it
        |
        +---- Store A receives internal dropship order
        |       |
        |       +---- Customer name from Store B
        |       +---- Customer email from Store B
        |       +---- 99% discount
        |       +---- Dropshipped_Order
        |       +---- Sold by Store_B
        |
        +---- Store C listing becomes unavailable
        |
        +---- Physical item becomes SOLD
```

Core identity:

```text
SKU
+
custom.supplier
+
Physical Item / Shared Relationship
```

Core protection:

```text
Reserve first.
Synchronize second.
Sell once.
```

Core deployment requirement:

```text
Git Repository
      |
      v
Vercel
      |
      v
Production
```

Secrets:

```text
Never commit .env.
Never expose private credentials in frontend.
Keep secrets server-side.
```

End goal:

**One physical thrift item. Multiple store listings. One successful sale. Zero overselling.**
