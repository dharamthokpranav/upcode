module.exports = {
    doctorLogin: "SELECT * FROM doctor_details WHERE email=? and password=?",
    getQuestionAnswers: "SELECT * FROM pres_doc_questions LEFT JOIN pres_questions ON pres_doc_questions.question_id = pres_questions.id where pres_doc_questions.question_id IN (?)",
    getPatientConsultaion:"SELECT * FROM pres_master_prescription LEFT JOIN pres_data ON pres_master_prescription.diagnosis_id = pres_data.end_result_id WHERE pres_master_prescription.diagnosis_id = ?",
    updatePatientConsultation:"UPDATE pres_master_prescription SET pres_master_prescription.diagnosis = CASE WHEN ?='' THEN pres_master_prescription.diagnosis ELSE ? END, pres_master_prescription.medicine_prescribed = CASE WHEN ?='' THEN pres_master_prescription.medicine_prescribed ELSE ? END WHERE pres_master_prescription.diagnosis_id = ?",
    getDoctorDashboardList:"SELECT * FROM pres_data  LEFT JOIN pres_data_master on pres_data.topic_id=pres_data_master.topic_id WHERE end_result_id <> -1 ORDER BY date_time DESC",
    getCurrentDateListCount:"SELECT COUNT(*) as today_count FROM pres_data WHERE end_result_id <> -1 and date(date_time) = CURDATE()",
    getCurrentWeekListCount:"SELECT COUNT(*) as week_count FROM pres_data WHERE end_result_id <> -1 and YEARWEEK(date_time) = YEARWEEK(NOW())"
}