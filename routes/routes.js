const express = require('express');

const router = express.Router();

const doctor_controller = require('../controllers/DoctorDashboardController');
const StatusUpdater = require('../modules/StatusUpdater');

const { body } = require('express-validator');
const sendEmail = require('../utils/CommomFunctions');
//Routes
router.post('/login', body('email').isEmail(), body('password').not().isEmpty(), doctor_controller.loginDoctor)
router.post('/getPatientConsultationData', body('diagnosis_id').not().isEmpty(), body('patient_id').not().isEmpty(), body('prescription_id').not().isEmpty(), body('assigned_doctor_id').not().isEmpty(), doctor_controller.getPatientConsultationData)
// router.post('/updatePatientConsultationData', body('diagnosis_id').not().isEmpty(), doctor_controller.updatePatientConsultationData)
router.post('/patientConsultationAction', doctor_controller.patientConsultationAction)
router.post('/updatePatientConsultationData', body('prescription_id').not().isEmpty(), body('user_id').not().isEmpty(),body('diagnosis_id').not().isEmpty(),doctor_controller.updatePatientConsultationDataNew)
router.post('/getDoctorDashboardData', body('assigned_doctor_id').not().isEmpty(), doctor_controller.getDoctorDashboardData)
router.post('/getQuestionAnswersData', body('test_name').not().isEmpty(), doctor_controller.getQuestionAnswersData)
router.post('/checkServicablePincode', body('pincode').not().isEmpty(), doctor_controller.verifyPincode)
router.post('/insertFreshdeskTicket', doctor_controller.insertFreshdeskTicket)


router.get('/testCron',  StatusUpdater.statusUpdater)
router.get('/testCron', StatusUpdater.statusUpdater)
router.get('/testEmails', sendEmail)

module.exports = router;
