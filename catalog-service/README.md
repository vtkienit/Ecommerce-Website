# Catalog Service

Owns product discovery data:

- product categories
- products and images
- variants, SKU and selling price
- flash-sale pricing
- product search and filtering
- admin-only category, product, variant and image management

Inventory quantity does not belong to this service. Commerce Service owns stock and references a catalog variant by `variantId`.

Public browsing APIs are available under `/api`. Catalog management APIs are under `/api/admin/catalog` and require a JWT with the `Admin` role.
