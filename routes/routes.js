const sendEmail = require('../utils/CommomFunctions');
//Routes
router.post('/login', body('email').isEmail(), body('password').not().isEmpty(), doctor_controller.loginDoctor)
router.post('/getPatientConsultationData', body('diagnosis_id').not().isEmpty(), body('patient_id').not().isEmpty(),body('prescription_id').not().isEmpty(), doctor_controller.getPatientConsultationData)
router.post('/getPatientConsultationData', body('diagnosis_id').not().isEmpty(), body('patient_id').not().isEmpty(), body('prescription_id').not().isEmpty(), doctor_controller.getPatientConsultationData)
router.post('/updatePatientConsultationData', body('diagnosis_id').not().isEmpty(), doctor_controller.updatePatientConsultationData)
router.post('/patientConsultationAction', doctor_controller.patientConsultationAction)
router.post('/approveRequest', body('prescription_id').not().isEmpty(),body('topic_id').not().isEmpty(), body('user_id').not().isEmpty(),body('diagnosis_id').not().isEmpty(),doctor_controller.approveRequest)
router.post('/approveRequest', body('prescription_id').not().isEmpty(), body('topic_id').not().isEmpty(), body('user_id').not().isEmpty(), body('diagnosis_id').not().isEmpty(), doctor_controller.approveRequest)
router.get('/getDoctorDashboardData', doctor_controller.getDoctorDashboardData)
router.post('/getQuestionAnswersData', body('test_name').not().isEmpty(), doctor_controller.getQuestionAnswersData)


router.get('/testCron',  StatusUpdater.statusUpdater)
router.get('/testEmails',  sendEmail)
router.get('/testCron', StatusUpdater.statusUpdater)
router.get('/testEmails', sendEmail)

