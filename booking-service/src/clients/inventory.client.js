const axios = require('axios');

// URL del servicio de Daniel (Persona 1)
const INVENTORY_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3002';

// Función para reservar (Paso 2 de la Saga)
const reserveInventory = async (eventId, quantity, requestId) => {
    try {
        const response = await axios.post(`${INVENTORY_URL}/inventory/reserve`, {
            eventId,
            quantity,
            requestId
        });
        return response.data;
    } catch (error) {
        throw new Error('Error al conectar con Inventario');
    }
};

// Función para liberar si el pago falla (Acción compensatoria)
const releaseInventory = async (eventId, quantity, requestId) => {
    try {
        await axios.post(`${INVENTORY_URL}/inventory/release`, {
            eventId,
            quantity,
            requestId
        });
    } catch (error) {
        console.error('Error al liberar inventario:', error.message);
        throw error;
    }
};

const reserveSeat = async (eventId, seatCode, requestId, bookingId) => {
    try {
        const response = await axios.post(`${INVENTORY_URL}/inventory/seats/reserve`, {
            eventId,
            seatCode,
            requestId,
            bookingId
        });
        return response.data;
    } catch (error) {
      if (error.response && error.response.status === 409) {
        throw new Error('SEAT_CONTENTION');
      }
      throw new Error('Error reserving seat');
    }
};

const confirmSeat = async (eventId, seatCode, bookingId) => {
    try {
        const response = await axios.post(`${INVENTORY_URL}/inventory/seats/confirm`, {
            eventId,
            seatCode,
            bookingId
        });
        return response.data;
    } catch (error) {
        throw new Error('Error confirming seat');
    }
};

const releaseSeat = async (eventId, seatCode, bookingId) => {
    try {
        const response = await axios.post(`${INVENTORY_URL}/inventory/seats/release`, {
            eventId,
            seatCode,
            bookingId
        });
        return response.data;
    } catch (error) {
        throw new Error('Error releasing seat');
    }
};

module.exports = {
    reserveInventory,
    releaseInventory,
    reserveSeat,
    confirmSeat,
    releaseSeat
};