const inventoryService = require('../services/inventory.service')

const reserveTicket = async (req, res) => {
  try {
    const { eventId, quantity = 1 } = req.body
    const result = await inventoryService.reserve(eventId, quantity)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const releaseTicket = async (req, res) => {
  try {
    const { eventId, quantity = 1 } = req.body
    const result = await inventoryService.release(eventId, quantity)
    res.status(200).json(result)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
}

const getInventory = async (req, res) => {
  try {
    const { eventId } = req.params
    const result = await inventoryService.getByEventId(eventId)
    res.status(200).json(result)
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}

module.exports = {
  reserveTicket,
  releaseTicket,
  getInventory
}