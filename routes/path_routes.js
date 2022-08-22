const express = require('express');
const pathologyController = require('../controllers/PathologyController');
const router = express.Router();

router.post('/authinticate', pathologyController.authinticate)
router.post('/find-available-slots', pathologyController.FindAvailableSlotByLocation)

module.exports = router;