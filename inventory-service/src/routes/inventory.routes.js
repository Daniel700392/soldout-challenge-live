const express = require('express');

const router = express.Router();

const inventoryController = require('../controllers/inventory.controller');

// New event and seat endpoints
router.get('/events', inventoryController.listEvents);
router.get('/events/:eventId/seats', inventoryController.getSeats);

// Existing inventory endpoint (preserved for backward compatibility)
router.get('/:eventId', inventoryController.getInventory);

// Seat reservation endpoints
router.post('/seats/reserve', inventoryController.reserveSeat);
router.post('/seats/release', inventoryController.releaseSeat);
router.post('/seats/confirm', inventoryController.confirmSeat);

module.exports = router;