create unique index if not exists orders_tracking_code_unique_idx
    on orders (upper(tracking_code))
    where tracking_code is not null;
