module.exports = {
    doctorLogin: "SELECT * FROM doctor_details WHERE email=? and password=?",
    getPatientConsultaion:"SELECT * FROM pres_master_prescription LEFT JOIN pres_data ON pres_master_prescription.diagnosis_id = pres_data.end_result_id WHERE pres_master_prescription.diagnosis_id = ?",
    updatePatientConsultation:"UPDATE pres_master_prescription SET pres_master_prescription.diagnosis = CASE WHEN ?='' THEN pres_master_prescription.diagnosis ELSE ? END, pres_master_prescription.medicine_prescribed = CASE WHEN ?='' THEN pres_master_prescription.medicine_prescribed ELSE ? END WHERE pres_master_prescription.diagnosis_id = ?"
}