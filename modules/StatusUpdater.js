const service = require("../services/DoctorDashboardService");
const commonFunctions = require("../utils/CommomFunctions");
var moment = require("moment");
const { validationResult } = require('express-validator');


exports.statusUpdater = (req, res) => {
    var serv = new service();
    var overdueArray = [];
    serv.getPatientConsultationList(function (err, result) {
        try {
            if (err) {
                res.send(err);
            } else {
                result.forEach(element => {
                    var then = element.date_time;
                    var minuteDifference = Math.round(moment.duration(moment().diff(moment(then))).asMinutes());
                    if (element.due_status == "OKAY") {
                        if (minuteDifference == 5 || minuteDifference > 5) {
                            console.log("Status Overdue id:  " + element.ID);
                            console.log(minuteDifference);
                            overdueArray.push(element.ID);
                        }
                        else {
                            console.log("Status Overdue id:  " + element.ID);
                            console.log(minuteDifference);

                        }
                    }
                });
                serv.updateConsultationStatus(overdueArray, function (err, result) {
                    if (err) {
                        res.send(err);
                    } else {
                        res.json({ "success": true, "message": "Status updated successfully", "data": result });
                    }
                });
            }

        } catch (error) {
            console.log(error);
        }
    });
};