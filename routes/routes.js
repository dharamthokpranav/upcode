const express = require('express');

const router = express.Router();

const doctor_controller = require('../controllers/DoctorDashboardController')

//Routes
router.post('/login', doctor_controller.loginDoctor)
// router.post('/get-user-info', getUserInfo)

module.exports = router;