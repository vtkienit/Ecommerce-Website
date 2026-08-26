# Ecommerce Website

## Service architecture

| Service | Default port | Owns |
| --- | ---: | --- |
| `api-gateway` | `8080` | public HTTP/WebSocket entry point and request routing |
| `user-service` | `8081` | authentication, Google login and user profiles |
| `catalog-service` | `8082` | categories, products, variants, prices and promotions |
| `commerce-service` | `8083` | carts, orders, payments, vouchers, inventory and stock reservations |

Each backend service is an independent Spring Boot project under its own `app` directory. The frontend sends every API and notification WebSocket request to `api-gateway`; internal services remain responsible for authorization and business rules. Catalog and Commerce use the `catalog` and `commerce` database schemas by default.

Commerce references users and catalog variants through scalar IDs instead of cross-service JPA relationships. Order items keep product and price snapshots so historical orders remain unchanged when the catalog changes.

## Product image storage

Catalog administrators can upload one main image and multiple secondary images for each product. Files are uploaded by `catalog-service` to the public Supabase Storage bucket `product-images`; the Supabase server key is never sent to the browser.

Add these values to the root `.env` file:

```properties
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=sb_secret_your_server_key
```

Get the server key from **Supabase Dashboard → Project Settings → API Keys → Secret keys**. A legacy `service_role` key also works, but it must only be used by the backend. The Catalog Service creates the public bucket on the first upload. Images must be JPG, PNG or WEBP, up to 5 MB each, with a maximum of 10 images per product.

## Run tests

Run `mvnw.cmd test` from each service's `app` directory. The default local startup order is User (`8081`), Catalog (`8082`), Commerce (`8083`) and API Gateway (`8080`).
