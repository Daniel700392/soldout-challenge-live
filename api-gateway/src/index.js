const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// Redirigir llamadas de reservas al puerto 3003 (tu Booking Service)
app.use('/bookings', createProxyMiddleware({ 
    target: 'http://booking-service:3003', 
    changeOrigin: true 
}));

app.listen(8080, () => {
    console.log('🚀 API Gateway funcionando en el puerto 8080');
});