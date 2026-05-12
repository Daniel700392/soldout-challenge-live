const express = require('express')
const router = express.Router()

const {
  reserveTicket,
  releaseTicket,
  getInventory
} = require('../controllers/inventory.controller')

router.post('/reserve', reserveTicket)
router.post('/release', releaseTicket)
router.get('/:eventId', getInventory)

module.exports = router