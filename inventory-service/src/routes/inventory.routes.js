const express = require('express');

const router = express.Router();

const inventoryController = require('../controllers/inventory.controller');

router.get('/:eventId', inventoryController.getInventory);
router.post('/reserve', inventoryController.reserve);
router.post('/release', inventoryController.release);

module.exports = router;