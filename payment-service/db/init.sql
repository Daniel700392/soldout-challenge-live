CREATE TABLE payments (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE outbox_events (
  id UUID PRIMARY KEY,
  event_type VARCHAR(100),
  payload JSONB,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);