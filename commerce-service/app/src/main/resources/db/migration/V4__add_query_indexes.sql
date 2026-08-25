CREATE INDEX IF NOT EXISTS orders_user_created_at_idx
    ON orders (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS orders_status_created_at_idx
    ON orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS order_items_order_idx
    ON order_items (order_id);

CREATE INDEX IF NOT EXISTS payments_order_idx
    ON payments (order_id);

CREATE INDEX IF NOT EXISTS stock_reservations_order_idx
    ON stock_reservations (order_id);

CREATE INDEX IF NOT EXISTS stock_reservations_inventory_status_expiry_idx
    ON stock_reservations (inventory_id, status, expires_at);

CREATE INDEX IF NOT EXISTS return_requests_user_requested_at_idx
    ON return_requests (user_id, requested_at DESC);
