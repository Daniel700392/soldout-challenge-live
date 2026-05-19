-- Necesitamos esta extensión para generar los IDs automáticos (UUIDs)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_id UUID NOT NULL,
    quantity INTEGER NOT NULL,
    -- UNIQUE es la clave aquí: impide que se use el mismo requestId dos veces
    request_id UUID UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);