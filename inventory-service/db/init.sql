CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID UNIQUE NOT NULL,
  available_tickets INT NOT NULL CHECK (available_tickets >= 0),
  reserved_tickets INT NOT NULL DEFAULT 0 CHECK (reserved_tickets >= 0)
);

CREATE INDEX IF NOT EXISTS idx_inventory_event_id
ON inventory(event_id);