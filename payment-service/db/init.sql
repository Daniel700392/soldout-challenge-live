CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY,
  booking_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_booking_id
ON payments(booking_id);