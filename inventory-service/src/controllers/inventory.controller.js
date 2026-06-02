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

// New controller functions for seat management
async function listEvents(req, res) {
  try {
    const events = await inventoryService.listEvents();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getSeats(req, res) {
  try {
    const { eventId } = req.params;
    const seats = await inventoryService.getSeats(eventId);
    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function reserveSeat(req, res) {
  try {
    const { eventId, seatCode, requestId, bookingId } = req.body;
    if (!eventId || !seatCode || !requestId || !bookingId) {
      return res.status(400).json({ error: 'eventId, seatCode, requestId, bookingId required' });
    }
    const result = await inventoryService.reserveSeat(eventId, seatCode, requestId, bookingId);
    res.status(200).json(result);
  } catch (error) {
    if (error.code === 'SEAT_CONFLICT') {
      return res.status(409).json({ error: 'Seat already reserved or sold' });
    }
    res.status(400).json({ error: error.message });
  }
}

async function releaseSeat(req, res) {
  try {
    const { eventId, seatCode, bookingId } = req.body;
    if (!eventId || !seatCode || !bookingId) {
      return res.status(400).json({ error: 'eventId, seatCode, bookingId required' });
    }
    const result = await inventoryService.releaseSeat(eventId, seatCode, bookingId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function confirmSeat(req, res) {
  try {
    const { eventId, seatCode, bookingId } = req.body;
    if (!eventId || !seatCode || !bookingId) {
      return res.status(400).json({ error: 'eventId, seatCode, bookingId required' });
    }
    const result = await inventoryService.confirmSeat(eventId, seatCode, bookingId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

module.exports = {
  getInventory,
  reserve,
  release,
  listEvents,
  getSeats,
  reserveSeat,
  releaseSeat,
  confirmSeat,
};