# Ecommerce Website

## Service architecture

| Service | Default port | Owns |
| --- | ---: | --- |
| `api-gateway` | `8080` | public HTTP/WebSocket entry point and request routing |
| `user-service` | `8081` | authentication, Google login and user profiles |
| `catalog-service` | `8082` | categories, products, variants, prices and promotions |
| `commerce-service` | `8083` | carts, orders, payments, vouchers, inventory and stock reservations |

Each backend service is an independent Spring Boot project under its own `app` directory. The frontend sends every API and notification WebSocket request to `api-gateway`. The gateway validates JWT roles and rate-limits sensitive authentication endpoints with Redis; internal services still validate authorization and business rules as a second protection layer. Catalog and Commerce use the `catalog` and `commerce` database schemas by default.

Authentication uses a 15-minute JWT access token and a rotating refresh token. The browser receives the refresh token only as an `HttpOnly`, `SameSite=Lax` cookie, while Redis stores only its SHA-256 hash. The cookie lasts for the browser session by default, or 30 days when **Remember me** is selected. Refresh tokens are replaced after every refresh and revoked on logout or password reset.

Local HTTP development uses `REFRESH_TOKEN_COOKIE_SECURE=false` by default. Set it to `true` in the production deployment so the refresh cookie is sent only over HTTPS. If the frontend and API are deployed on different sites, also set `REFRESH_TOKEN_COOKIE_SAME_SITE=None`; otherwise keep the safer `Lax` default. These are deployment settings, not secrets, so they do not belong in the root `.env` file.

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
