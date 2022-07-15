const dbaccess = require("../database/dbaccess");
const queries = require("../database/queries");
var ObjectId = require('mongodb').ObjectID;
class DoctorDashboardService {

    constructor() { }

    async loginDoctor(userInfo, result) {
        const connection = dbaccess.openConnection();
        try {
            connection.query(queries.doctorLogin, [userInfo.email, userInfo.password], function (err, res) {
                if (err) {
                    result(err, null);
                }
                else {
                    result(null, res);
                }

            })
        }
        catch (error) {
            console.log("Method:LoginUser,File:appservice.js--> " + error);
        }
        finally {
            dbaccess.closeConnection(connection);
        }

    }


    async getPatientConsultationData(userInfo, result) {
        var responseArray = [];
        let O_id = new ObjectId(userInfo.patient_id)
        let reqSeq = {
            collection: "userdetails",
            userid: O_id,
            key: "_id"
        }
        const connection = dbaccess.openConnection();

        try {
            let res_mongodb = await this.getUserDetails(reqSeq);
            if (res_mongodb.status == 200) {
                connection.query(
                    queries.getPatientConsultaion, [userInfo.diagnosis_id], function (err, res_mysql) {
                        if (err) {
                            result(err, null);
                        } else {
                            responseArray.push({ dignosisAndMedicene: res_mysql[0] }, { patient_background: res_mongodb.data[0] })
                            result(null, responseArray);
                        }
                    })
            }
            else {
                console.log("Patient data not found");
                result(err, null);
            }
        }
        catch (error) {
            console.log("Method:getPatientConsultationData,File:services\DoctorDashboardService.js--> " + error);
        }
        finally {
            dbaccess.closeConnection(connection);
        }
    }

    async updatePatientConsultationData(updateData, result) {
        const connection = dbaccess.openConnection();
        try {
            connection.query(queries.updatePatientConsultation, [updateData.diagnosis, updateData.diagnosis, updateData.medicine_prescribed, updateData.medicine_prescribed, updateData.diagnosis_id,], function (err, res) {
                if (err) {
                    result(err, null);
                } else {
                    result(null, res);
                }
            }
            );
        } catch (error) {
            console.log("Method:LoginUser,File:appservice.js--> " + error);
        } finally {
            dbaccess.closeConnection(connection);
        }
    }


    async getDoctorDashboardData(result) {
        const connection = dbaccess.openConnection();
        try {
            connection.query(`${queries.getDoctorDashboardList};${queries.getCurrentDateListCount};${queries.getCurrentWeekListCount}`, function (err, res) {
                if (err) {
                    result(err, null);
                } else {
                    let response;
                    response={
                        list:res[0],
                        today_count:res[1][0].today_count,
                        week_count:res[2][0].week_count
                    }
                    result(null, response);
                }
            }
            );
        } catch (error) {
            console.log("Method:LoginUser,File:appservice.js--> " + error);
        } finally {
            dbaccess.closeConnection(connection);
        }
    }


    //Functions
    async getUserDetails(req) {
        try {
            var Mongo = dbaccess.openMongoDBConnection();
            var FindData = await Mongo.db(process.env.DBNAME).collection(req.collection).find({ [req.key]: req.userid }).toArray();
            if (FindData.length > 0) {
                return ({ status: 200, message: "success", data: FindData });
            }
            return ({ status: 400, message: "No data was found in the database" });
        } catch (error) {
            return ({ status: 502, message: "error", respText: error.message });
        }
    }
}
module.exports = DoctorDashboardService;
