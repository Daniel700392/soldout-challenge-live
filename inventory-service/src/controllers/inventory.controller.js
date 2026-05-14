const inventoryService = require('../services/inventory.service');

async function getInventory(req, res) {
  try {
    const inventory = await inventoryService.getInventory(req.params.eventId);
    res.status(200).json(inventory);
  } catch (error) {
    res.status(404).json({
      error: error.message,
    });
  }
}

async function reserve(req, res) {
  try {
    const { eventId, quantity = 1, requestId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        error: 'eventId required',
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        error: 'quantity must be greater than 0',
      });
    }

    if (!requestId) {
      return res.status(400).json({
        error: 'requestId required',
      });
    }

    const result = await inventoryService.reserveTickets(
      eventId,
      quantity,
      requestId
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

async function release(req, res) {
  try {
    const { eventId, quantity = 1 } = req.body;

    if (!eventId) {
      return res.status(400).json({
        error: 'eventId required',
      });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        error: 'quantity must be greater than 0',
      });
    }

    const result = await inventoryService.releaseTickets(eventId, quantity);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = {
  getInventory,
  reserve,
  release,
};