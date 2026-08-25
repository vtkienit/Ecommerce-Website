alter table orders add column if not exists shipping_carrier varchar(100);
alter table orders add column if not exists tracking_code varchar(100);
alter table orders add column if not exists shipped_at timestamp;
