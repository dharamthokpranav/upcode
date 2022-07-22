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
                connection.query(queries.getPatientConsultaion, [userInfo.diagnosis_id,userInfo.prescription_id], async function (err, res_mysql) {
                    if (err) {
                        result(err, null);
                    } else {
                        if (res_mysql.length != 0) {
                            var promiseQuestionAnswer, promiseMedicalHistory 
                            if (res_mysql[0].question_ans != null && res_mysql[0].question_ans != "") {
                                promiseQuestionAnswer = new Promise((resolve, reject) => {
                                    DoctorDashboardService.getQuestionAnswersObject(res_mysql[0].question_ans, function (resultObj) {
                                        resolve(resultObj);
                                    })
                                });
                            }

                            // }
                            if (res_mysql[0].medical_history != null && res_mysql[0].medical_history != "") {
                                promiseMedicalHistory = new Promise((resolve, reject) => {
                                    DoctorDashboardService.getQuestionAnswersObject(res_mysql[0].medical_history, function (resultObj) {
                                        resolve(resultObj);
                                    })
                                });
                            }
                            Promise.all([promiseQuestionAnswer, promiseMedicalHistory]).then(data => {
                                delete res_mysql[0].question_ans;
                                delete res_mysql[0].medical_history;
                                responseArray.push({ dignosisAndMedicene: res_mysql[0] }, { patient_background: res_mongodb.data[0] }, { chief_complaints: typeof data[0] !== 'undefined' ? data[0] : [] }, { medical_history: typeof data[1] !== 'undefined' ? data[1] : [] })

                                result(null, responseArray);
                            })
                                .catch(error => {
                                    console.log(error)
                                })
                        }
                        else {
                            result(null, res_mysql)
                        }
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

    static async getQuestionAnswersObject(responseObj, callback) {
        let tempQuestionArray = responseObj.split('||').map(value => (JSON.parse(value).QID))
        let tempAnswerMapArray = responseObj.split('||').map(value => ({ QID: JSON.parse(value).QID, ID: JSON.parse(value).ID }))

        try {
            const connection = dbaccess.openConnection();
            connection.query(queries.getQuestionAnswers, [tempQuestionArray], async function (error, res_questions) {
                if (error) {
                    // return ({ status: 502, message: "error", respText: error.message });
                    callback([])

                }
                else {
                    if (res_questions.length) {
                        let questionsTemp = res_questions.map(value => ({
                            question_id: value.question_id,
                            question: value.questions,
                            answer: JSON.parse('[' + value.options + ']').find(({ ID }) => ID === tempAnswerMapArray.find(({ QID }) => QID === value.question_id).ID).Option,
                        }))
                        responseObj = questionsTemp

                    }
                    console.log("function response", responseObj)
                    // return responseObj
                    callback(responseObj)
                }
            })
        }
        catch (error) {
            console.log("Method:getPatientConsultationData,File:services\DoctorDashboardService.js--> " + error);
        }
    }
}

module.exports = DoctorDashboardService;
