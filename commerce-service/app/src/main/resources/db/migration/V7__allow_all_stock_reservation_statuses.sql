DO $$
BEGIN
    IF to_regclass(current_schema() || '.stock_reservations') IS NOT NULL THEN
        ALTER TABLE stock_reservations
            DROP CONSTRAINT IF EXISTS stock_reservations_status_check;

        ALTER TABLE stock_reservations
            ADD CONSTRAINT stock_reservations_status_check
            CHECK (status IN ('ACTIVE', 'CONFIRMED', 'CONSUMED', 'RELEASED', 'EXPIRED'));
    END IF;
END
$$;
