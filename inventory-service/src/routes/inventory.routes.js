const express = require('express')

const router = express.Router()

const {
  reserveTicket
} = require('../controllers/inventory.controller')

router.post('/reserve', reserveTicket)

module.exports = router