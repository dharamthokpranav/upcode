const service = require("../services/DoctorDashboardService");

var moment = require("moment");

exports.loginDoctor = (req, res) => {
    var response;
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
    let setdata = {
        diagnosis_id: req.body.diagnosisid,
        patient_id: req.body.patientid
    };
    var serv = new service();
    serv.getPatientConsultationData(setdata, function (err, result) {
        try {
            if (err) {
                res.send(err);
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
