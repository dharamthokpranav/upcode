const service = require("../services/DoctorDashboardService");
const sendEmail = require("../utils/CommomFunctions");
const constants = require("../utils/constants");
var moment = require("moment");
const { validationResult } = require('express-validator');
const sendpdf = require("../utils/CommomFunctions");

exports.loginDoctor = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ "success": false, errors: errors.array() });
    }
    let setdata = {
        email: req.body.email,
        password: req.body.password,
        updateTimestamp: moment().tz("Asia/Colombo").format()
    }
    var serv = new service();
    serv.loginDoctor(setdata, function (err, result, fields) {
        try {
            if (err) {
                res.send(err);
            } else {
                if (result.length > 0) {
                    res.json({ "success": true, "message": "User authenticated successfully", "data": result });
                } else {
                    res.json({ "success": true, "message": "User authenticated successfully", "data": result });
                }
            }

        } catch (error) {
            console.log(error);
        }
    });
};

exports.getPatientConsultationData = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ "success": false, errors: errors.array() });
    }
    let setdata = {
        diagnosis_id: req.body.diagnosis_id,
        patient_id: req.body.patient_id,
        prescription_id: req.body.prescription_id
    };
    var serv = new service();
    serv.getPatientConsultationData(setdata, function (err, result) {
        try {
            if (err) {
                res.json(err.message);
            } else {
                if (result.length > 0) {
                    res.json({ success: true, message: "Patient consultation data found", data: result });
                } else {
                    res.json({ success: true, message: "patient consultation data not found", data: result });
                }
            }
        } catch (error) {
            console.log(error);
        }
    });
};

exports.updatePatientConsultationData = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ "success": false, errors: errors.array() });
    }
    let setdata = {
        medicine_prescribed: req.body.medicine_prescribed,
        diagnosis: req.body.diagnosis,
        diagnosis_id: req.body.diagnosis_id,
        investigation: req.body.investigation
    };
    var serv = new service();
    serv.updatePatientConsultationData(setdata, function (err, result, fields) {
        try {
            if (err) {
                res.send(err);
            } else {
                res.json({ success: true, message: "Patientconsultation data updated successfully" });
            }
        } catch (error) {
            console.log(error);
        }
    });
};

exports.patientConsultationAction = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ "success": false, errors: errors.array() });
    }
    let action = req.body.action;
    let setdata = {
        patient_id: req.body.patient_id
    };
    // action values= RESERVE, APPROVE
    var serv = new service();
    serv.getPatientContactDetailsFromMongoDB(setdata, function (err, result) {
        try {
            if (err) {
                res.send(err);
            } else {

                //create html 
                //Append the dignosis medecene investigation data to the html code
                //generaete pdf from html



            }
        } catch (error) {
            console.log(error);
        }
    });


    // response in data parameter can be RESERVE or APPROVE    
};

exports.getDoctorDashboardData = (req, res) => {
    var serv = new service();
    serv.getDoctorDashboardData(function (err, result) {
        try {
            if (err) {
                res.send(err);
            } else {
                res.json({ success: true, message: "Patient consultation data found", data: result });
            }
        } catch (error) {
            console.log(error);
        }
    });
};

exports.approveRequest = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ "success": false, errors: errors.array() });
    }
    let setdata = {
        prescription_id: req.body.prescription_id,
        user_id: req.body.user_id,
        diagnosis: req.body.diagnosis,
        diagnosis_id: req.body.diagnosis_id,
        priliminary_diagnosis: req.body.priliminary_diagnosis,
        medicine_prescribed: req.body.medicine_prescribed,
        pregnant_medicine: req.body.pregnant_medicine,
        investigation: req.body.investigation,
        pregnant_investigation: req.body.pregnant_investigation,
        important_note: req.body.important_note,
        pregnant_important_note: req.body.pregnant_important_note,
        topic_id: req.body.topic_id
    };
    var serv = new service();
    serv.approveRequest(setdata, function (err, result, fields) {
        try {
            if (err) {
                res.send(err);
            } else {
                res.json({ success: true, message: "Request Approved Successfuly", data: result, });
            }
        } catch (error) {
            console.log(error);
        }
    });
};

exports.getQuestionAnswersData = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ "success": false, errors: errors.array() });
    }
    let setdata = {
        test_name: req.body.test_name
    };
    var serv = new service();
    serv.getQuestionAnswersData(setdata, function (err, result) {
        try {
            if (err) {
                res.send(err);
            } else if (result.length === 0) {
                res.json({ success: false, message: "Question Answer Data Not Found", data: result });
            }
            else {
                res.json({ success: true, message: "Question Answer Data Found", data: result });
            }
        } catch (error) {
            console.log(error);
        }
    });
};