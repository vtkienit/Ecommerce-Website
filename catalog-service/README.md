# Catalog Service

Owns product discovery data:

- product categories
- products and images
- variants, SKU and selling price
- flash-sale pricing
- product search and filtering (when APIs are added)

Inventory quantity does not belong to this service. Commerce Service owns stock and references a catalog variant by `variantId`.
