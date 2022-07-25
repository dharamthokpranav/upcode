const service = require("../services/DoctorDashboardService");
const sendEmail = require("../utils/CommomFunctions");
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
        return res.status(400).json({ "success": false,errors: errors.array() });
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
        return res.status(400).json({ "success": false,errors: errors.array() });
    }
    let setdata = {
        medicine_prescribed: req.body.medicine_prescribed,
        diagnosis: req.body.diagnosis,
        diagnosis_id: req.body.diagnosis_id,
    };
    var serv = new service();
    serv.updatePatientConsultationData(setdata, function (err, result, fields) {
        try {
            if (err) {
                res.send(err);
            } else {
                res.json({ success: true, message: "Patientconsultation data updated successfully", data: result, });
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
    serv.getPatientContactDetailsFromMongoDB(setdata,function (err, result) {
        try {
            if (err) {
                res.send(err);
            } else {
                res.json({ success: true, message: "Patient data found", data: result });
                // email_to:result.data[0].email
                // device_token:result.data[0].divicetoken
                // var emailResponse= sendEmail();
                // sendpdf();
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