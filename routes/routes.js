const express = require('express');

const router = express.Router();

const doctor_controller = require('../controllers/DoctorDashboardController')

//Routes

// login route
router.post('/login', doctor_controller.loginDoctor)

// endpoint to get patient consultation data
router.post('/getPatientConsultationData', doctor_controller.getPatientConsultationData)
// router.post('/get-user-info', getUserInfo)

// endpoint to update Patient consultation data
router.post('/updatePatientConsultationData', doctor_controller.updatePatientConsultationData)


module.exports = router;