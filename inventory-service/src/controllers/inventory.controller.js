const inventoryService = require('../services/inventory.service')

const reserveTicket = async (req, res) => {

  try {

    const { eventId } = req.body

    const result = await inventoryService.reserve(eventId)

    res.status(200).json(result)

  } catch (error) {

    res.status(400).json({
      error: error.message
    })

  }

}

module.exports = {
  reserveTicket
}