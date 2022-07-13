const service = require("../services/DoctorDashboardService");

var moment = require("moment");

exports.loginDoctor = (req, res) => {
  var response;
  let setdata = {
    userid: req.body.userid,
    password: req.body.password,
    updateTimestamp: moment().tz("Asia/Colombo").format(),
  };
  var serv = new service();
  serv.loginDoctor(setdata, function (err, result, fields) {
    try {
      if (err) {
        res.send(err);
      } else {
        if (result.length > 0) {
          response = {
            success: true,
            message: "User authenticated successfully",
            data: result,
          };
        } else {
          response = {
            success: true,
            message: "User authenticated successfully",
            data: result,
          };
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
};

exports.getPatientConsultationData = (req, res) => {
  let setdata = {
    diagnosis_id: req.body.diagnosis_id,
  };
  var serv = new service();
  serv.getPatientConsultationData(setdata, function (err, result, fields) {
    try {
      if (err) {
        res.send(err);
      } else {
        if (result.length > 0) {
          res.json({
            success: true,
            message: "Extracting Data !!",
            data: result,
          });
        } else {
          res.json({
            success: true,
            message: "Extracting Data !!",
            data: result,
          });
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
        res.json({
          success: true,
          message: "Data Updated !!",
          data: result,
        });
      }
    } catch (error) {
      console.log(error);
    }
  });
};
