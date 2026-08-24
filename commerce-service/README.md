# Commerce Service

Owns the transactional shopping flow:

- cart and checkout
- orders and order lifecycle
- vouchers and payment status
- inventory and stock reservations
- overselling protection

References other services only through scalar identifiers such as `userId` and `variantId`. Order items keep product and price snapshots so historical orders do not change with the catalog.

## Current flow

- Authenticated cart APIs: add, update and remove items
- Checkout with COD
- Pessimistic inventory locking and stock reservations
- Order history and order cancellation
- Catalog variant snapshots fetched through `CATALOG_SERVICE_URL`
- Admin-only inventory sync and stock updates under `/api/admin/inventory`

New Catalog variants start with zero stock after synchronization. An admin must set the actual on-hand quantity before customers can buy them. Stock cannot be reduced below the quantity reserved by active orders.

The service validates the JWT issued by `user-service` using the shared `JWT_SECRET` and runs on port `8082` by default.
