-- migrations/add_events_and_seats.sql
-- Idempotent migration for events and seat-level inventory

-- 1. events table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    name VARCHAR NOT NULL,
    venue VARCHAR,
    event_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- 2. event_seats table
CREATE TABLE IF NOT EXISTS event_seats (
    id UUID PRIMARY KEY,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    seat_code VARCHAR NOT NULL,
    section VARCHAR DEFAULT 'GENERAL',
    row_label VARCHAR,
    seat_number INTEGER,
    status VARCHAR NOT NULL DEFAULT 'AVAILABLE',
    reserved_by UUID NULL,
    booking_id UUID NULL,
    reserved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT now(),
    UNIQUE(event_id, seat_code),
    CHECK (status IN ('AVAILABLE','RESERVED','SOLD','CANCELLED'))
);

-- 3. Insert demo event (fixed UUID)
INSERT INTO events (id, name, venue, event_date)
VALUES ('99999999-9999-9999-9999-999999999999',
        'Concierto SoldOut Demo',
        'SoldOut Arena',
        NOW())
ON CONFLICT (id) DO NOTHING;

-- 4. Insert demo seats (A‑I rows, 15 seats each)
DO $$
DECLARE
    seat_row CHAR;
    seat_num INT;
    seat_uuid UUID;
BEGIN
    FOR seat_row IN SELECT unnest(ARRAY['A','B','C','D','E','F','G','H','I']) LOOP
        FOR seat_num IN 1..15 LOOP
            seat_uuid := gen_random_uuid();
            INSERT INTO event_seats (
                id, event_id, seat_code, row_label, seat_number
            ) VALUES (
                seat_uuid,
                '99999999-9999-9999-9999-999999999999',
                seat_row || seat_num,
                seat_row,
                seat_num
            )
            ON CONFLICT (event_id, seat_code) DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
