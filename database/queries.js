module.exports = {
    doctorLogin: "SELECT * FROM doctor_details WHERE email=? and password=?",
    doctorLoginTimeStampUpdate: "UPDATE doctor_details SET last_login_timestamp = now() WHERE doctor_id = ?",
    getQuestionAnswers: "SELECT * FROM pres_doc_questions LEFT JOIN pres_questions ON pres_doc_questions.question_id = pres_questions.id where pres_doc_questions.question_id IN (?)",
    getPatientConsultaion: "SELECT * FROM pres_master_prescription LEFT JOIN pres_data ON pres_master_prescription.diagnosis_id = pres_data.end_result_id WHERE pres_master_prescription.diagnosis_id = ? and pres_data.ID=?",
    getPatientConsultaionFromUser: "SELECT * FROM pres_user_prescription LEFT JOIN pres_data ON pres_user_prescription.diagnosis_id = pres_data.end_result_id WHERE pres_user_prescription.diagnosis_id = ? and pres_data.ID=?",
    updatePatientConsultation: "UPDATE pres_master_prescription SET pres_master_prescription.diagnosis = CASE WHEN ?='' THEN pres_master_prescription.diagnosis ELSE ? END,pres_master_prescription.investigation = CASE WHEN ?='' THEN pres_master_prescription.investigation ELSE ? END, pres_master_prescription.medicine_prescribed = CASE WHEN ?='' THEN pres_master_prescription.medicine_prescribed ELSE ? END WHERE pres_master_prescription.diagnosis_id = ?",
    getDoctorDashboardList: "SELECT * FROM pres_data  LEFT JOIN pres_data_master on pres_data.topic_id=pres_data_master.topic_id WHERE end_result_id <> -1 ORDER BY date_time DESC",
    getCurrentDateListCount: "SELECT (SELECT COUNT(*) as today_count FROM pres_data WHERE end_result_id <> -1 and date(date_time) = CURDATE() and due_status='OKAY') as on_time,(SELECT COUNT(*) as today_count FROM pres_data WHERE end_result_id <> -1 and date(date_time) = CURDATE() and due_status='OVERDUE') as late",
    getCurrentWeekListCount: "SELECT (SELECT COUNT(*) as week_count FROM pres_data WHERE end_result_id <> -1 and YEARWEEK(date_time) = YEARWEEK(NOW()) and due_status='OKAY') as on_time,(SELECT COUNT(*) as week_count FROM pres_data WHERE end_result_id <> -1 and YEARWEEK(date_time) = YEARWEEK(NOW()) and due_status='OVERDUE') as late",
    updateConsultationDueStatus: "UPDATE pres_data SET due_status = 'OVERDUE', due_status_update_time=now() WHERE ID in (?)",
    approveRequest: "INSERT INTO pres_user_prescription (prescription_id,user_id,diagnosis_id,diagnosis,priliminary_diagnosis,medicine_prescribed,pregnant_medicine,investigation,pregnant_investigation,important_note,pregnant_important_note,topic_id) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    checkApproveRequest: "SELECT * FROM pres_user_prescription where prescription_id=?",
    updateApproveRequest: "UPDATE pres_user_prescription SET user_id = ?,diagnosis_id = ?,diagnosis = ?,priliminary_diagnosis = ?,medicine_prescribed = ?,pregnant_medicine = ?,investigation = ?,pregnant_investigation = ?,important_note = ?,pregnant_important_note = ?,topic_id = ? WHERE prescription_id = ?",
    getQuestionAnswers: "SELECT * FROM labtests_master RIGHT JOIN labtests_faq ON labtests_master.id=labtests_faq.testid where labtests_master.test_name=?"
}


