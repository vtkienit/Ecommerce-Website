DO $$
BEGIN
    IF to_regclass(current_schema() || '.payments') IS NOT NULL THEN
        ALTER TABLE payments
            DROP CONSTRAINT IF EXISTS payments_status_check;

        ALTER TABLE payments
            ADD CONSTRAINT payments_status_check
            CHECK (status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED', 'CANCELLED'));
    END IF;
END
$$;
