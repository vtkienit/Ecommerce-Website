# Commerce Service

Owns the transactional shopping flow:

- cart and checkout
- orders and order lifecycle
- vouchers and payment status
- inventory and stock reservations
- overselling protection

References other services only through scalar identifiers such as `userId` and `variantId`. Order items keep product and price snapshots so historical orders do not change with the catalog.
