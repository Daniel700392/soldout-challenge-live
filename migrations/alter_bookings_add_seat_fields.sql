-- migrations/alter_bookings_add_seat_fields.sql
-- Idempotent migration to extend bookings table for seat‑level bookings

-- Add nullable seat_code column if it does not exist
ALTER TABLE IF EXISTS bookings
    ADD COLUMN IF NOT EXISTS seat_code VARCHAR NULL;

-- Add nullable amount column if it does not exist
ALTER TABLE IF EXISTS bookings
    ADD COLUMN IF NOT EXISTS amount NUMERIC NULL;
