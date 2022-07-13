const express = require('express');

const router = express.Router();

const doctor_controller = require('../controllers/DoctorDashboardController');

const { body } = require('express-validator');

//Routes

// login route
router.post('/login', body('email').isEmail(), body('password').not().isEmpty(), doctor_controller.loginDoctor)

// endpoint to get patient consultation data
router.post('/getPatientConsultationData', body('diagnosis_id').not().isEmpty(), body('patientid').not().isEmpty(), doctor_controller.getPatientConsultationData)
// router.post('/get-user-info', getUserInfo)

// endpoint to update Patient consultation data
router.post('/updatePatientConsultationData', body('diagnosis_id').not().isEmpty(), doctor_controller.updatePatientConsultationData)

//endpoint to handle action buttons on patient consultation screen
router.post('/patientConsultationAction', body('action').not().isEmpty().custom(value => {
    if (value == 'RESERVE' || value == 'APPROVE') {
        return true
    }
    else {
        return Promise.reject('Value should be APPROVE or RESERVE');
    }
}), doctor_controller.patientConsultationAction)


module.exports = router;