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
        let O_id = new ObjectId('624d42aac92bd21c7d7ad8fc')
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
                            if (res_mysql[0].question_ans != null) {
                                let tempQuestionArray = res_mysql[0].question_ans.split('||').map(value => (JSON.parse(value).QID))
                                let tempAnswerMapArray = res_mysql[0].question_ans.split('||').map(value => ({ QID: JSON.parse(value).QID, ID: JSON.parse(value).ID }))
                                const connection = dbaccess.openConnection();
                                try {
                                    connection.query(queries.getQuestionAnswers, [tempQuestionArray], function (error, res_questions) {
                                        if (error) {
                                            result(error, null);
                                        }
                                        else {
                                            if (res_questions.length) {
                                                let questionsTemp = res_questions.map(value => ({
                                                    question_id: value.question_id,
                                                    question: value.questions,
                                                    answer: JSON.parse('[' + value.options + ']').find(({ ID }) => ID === tempAnswerMapArray.find(({ QID }) => QID === value.question_id).ID).Option,
                                                }))
                                                res_mysql[0].question_ans = questionsTemp
                                                responseArray.push({ dignosisAndMedicene: res_mysql[0] }, { patient_background: res_mongodb.data[0] }, { chief_complaints: res_mysql[0].question_ans })
                                                result(null, responseArray);

                                            }
                                            else {
                                                responseArray.push({ dignosisAndMedicene: res_mysql[0] }, { patient_background: res_mongodb.data[0] }, { chief_complaints: res_mysql[0].question_ans })
                                                result(null, responseArray);
                                            }
                                        }
                                    })
                                }
                                catch (error) {
                                    console.log("Method:getPatientConsultationData,File:services\DoctorDashboardService.js--> " + error);
                                }
                                finally {
                                    dbaccess.closeConnection(connection);
                                }
                            }
                            else {
                                responseArray.push({ dignosisAndMedicene: res_mysql[0] }, { patient_background: res_mongodb.data[0] }, { chief_complaints: res_mysql[0].question_ans })
                                result(null, responseArray);
                            }
                            // responseArray.push({ dignosisAndMedicene: res_mysql[0] }, { patient_background: res_mongodb.data[0] })

                        }
                    })
            }
            else {
                console.log("Patient data not found");
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
                    response = {
                        list: res[0],
                        today_count: res[1][0].today_count,
                        week_count: res[2][0].week_count
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
