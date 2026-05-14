const axios = require('axios');

// URL del servicio de Pagos (Persona 3)
const PAYMENT_URL = process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3003';

const processPayment = async (bookingId, amount) => {
    try {
        const response = await axios.post(`${PAYMENT_URL}/payments/process`, {
            bookingId,
            amount
        });
        return response.data; // Esperamos estado COMPLETED o FAILED
    } catch (error) {
        throw new Error('Error en el servicio de pagos');
    }
};

module.exports = { processPayment };