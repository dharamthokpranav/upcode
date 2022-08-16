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
                    const connection = dbaccess.openConnection();
                    try {
                        connection.query(queries.doctorLoginTimeStampUpdate, [res[0].doctor_id], function (err2, res2) {
                            if (err2) {
                                result(err2, null);
                            }
                            else {
                                result(null, res, res2);
                            }

                        })
                    } catch (error) {
                        console.log("Method:LoginUser,File:appservice.js--> " + error);
                    }
                    finally {
                        dbaccess.closeConnection(connection);
                    }
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
        var getPatientConsultaionQuery;
        let O_id = new ObjectId(userInfo.patient_id);
        let reqSeq = {
            collection: "userdetails",
            userid: O_id,
            key: "_id"
        }

        try {
            let res_mongodb;
            this.getUserDetailsFromMysql(userInfo, function (data) {
                res_mongodb = data
                // });
                if (res_mongodb.status == 200) {
                    const connection = dbaccess.openConnection();
                    connection.query(queries.checkApproveRequest, [userInfo.prescription_id], function (err, res_exist) {
                        if (err) {
                            result(err, null);
                        }
                        else if (res_exist.length === 0) {

                            getPatientConsultaionQuery = queries.getPatientConsultaion
                        }
                        else {
                            getPatientConsultaionQuery = queries.getPatientConsultaionFromUser
                        }
                        const connection = dbaccess.openConnection();
                        try {
                            connection.query(getPatientConsultaionQuery, [userInfo.diagnosis_id, userInfo.prescription_id, userInfo.assigned_doctor_id], async function (err, res_mysql) {
                                if (err) {
                                    result(err, null);
                                } else {
                                    if (res_mysql.length != 0) {
                                        var obj = new DoctorDashboardService();

                                        var promiseQuestionAnswer, promiseMedicalHistory;
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
                                            let medicineData;
                                            responseArray.push({ dignosis: res_mysql[0] }, { patient_background: res_mongodb.data[0] }, { chief_complaints: typeof data[0] !== 'undefined' ? data[0] : [] }, { medical_history: typeof data[1] !== 'undefined' ? data[1] : [] })
                                            if (res_mysql[0].is_pregnant == '1') {
                                                // var substring_medicene=res_mysql[0].medicine_prescribed.split('||').length == 0 ? [res_mysql[0].medicine_prescribed] : res_mysql[0].medicine_prescribed.split('||');
                                                responseArray.push({ investigation: res_mysql[0].pregnant_investigation ? (res_mysql[0].pregnant_investigation.split('||').length == 0 ? [res_mysql[0].pregnant_investigation] : res_mysql[0].pregnant_investigation.split('||')) : ["NA"] })
                                                if (res_mysql[0].medicine_prescribed != "") {
                                                    obj.splitMedicineData(res_mysql[0].pregnant_medicine, (mediceneElement) => {
                                                        responseArray.push({ medicene_prescribed: mediceneElement })
                                                    });

                                                } else {
                                                    responseArray.push({ medicene_prescribed: [] })
                                                }
                                            }
                                            else if (res_mysql[0].is_pregnant == '0') {
                                                // let medicine_data = DoctorDashboardService.splitMedicineData(res_mysql[0].medicine_prescribed)
                                                // responseArray.push({ investigation: res_mysql[0].investigation ? (res_mysql[0].investigation.split('||').length == 0 ? [res_mysql[0].investigation] : res_mysql[0].investigation.split('||')) : ["NA"] })
                                                responseArray.push({ investigation: res_mysql[0].investigation ? (res_mysql[0].investigation.split('||').length == 0 ? [res_mysql[0].investigation] : res_mysql[0].investigation.split('||')) : ["NA"] })
                                                obj.splitMedicineData(res_mysql[0].medicine_prescribed, (MedicineElement) => {
                                                    responseArray.push({ medicene_prescribed: MedicineElement })
                                                });


                                            }
                                            responseArray.push({ medicene_note: "note" })
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
                        } catch (error) {
                            console.log("Method:getPatientConsultationData,File:DoctorDashboardService.js--> " + error);
                            result(error, null);
                        }
                        finally {
                            dbaccess.closeConnection(connection);
                        }
                    })

                }
                else {
                    console.log("Patient data not found");
                    result(null, []);
                }

                //result("Something went wrong", null);
            });
        }
        catch (error) {
            console.log("Method:getPatientConsultationData,File:DoctorDashboardService.js--> " + error);
            result(error, null);
        }
        // finally {
        //     dbaccess.closeConnection(connection);
        // }
    }





    async updatePatientConsultationData(updateData, result) {
        const connection = dbaccess.openConnection();
        try {
            connection.query(queries.updatePatientConsultation, [updateData.diagnosis, updateData.diagnosis, updateData.investigation, updateData.investigation, updateData.medicine_prescribed, updateData.medicine_prescribed, updateData.diagnosis_id,], function (err, res) {
                if (err) {
                    result(err, null);
                } else {
                    result(null, res);
                }
            }
            );
        } catch (error) {
            console.log("Method:updatePatientConsultationData,File:DoctorDashboardService.js--> " + error);
        } finally {
            dbaccess.closeConnection(connection);
        }
    }

    async approveRequest(data, result) {
        const connection = dbaccess.openConnection();
        try {
            connection.query(queries.checkApproveRequest, [data.prescription_id], function (err, res_exist) {
                if (err) {
                    result(err, null);
                }
                else if (res_exist.length === 0) {
                    const connection = dbaccess.openConnection();
                    // check if data exist or not
                    try {
                        connection.query(queries.approveRequest, [data.prescription_id, data.user_id, data.diagnosis_id, data.diagnosis, data.priliminary_diagnosis, data.medicine_prescribed, data.pregnant_medicine, data.investigation, data.pregnant_investigation, data.important_note, data.pregnant_important_note, data.topic_id], function (err, res) {
                            if (err) {
                                result(err, null);
                            } else {
                                result(null, res);
                            }
                        }
                        );
                    } catch (error) {
                        console.log("Method:approveRequest,File:DoctorDashboardService.js--> " + error);
                    } finally {
                        dbaccess.closeConnection(connection);
                    }
                }
                else {
                    const connection = dbaccess.openConnection();
                    // check if data exist or not
                    try {
                        connection.query(queries.updateApproveRequest, [data.user_id, data.diagnosis_id, data.diagnosis, data.priliminary_diagnosis, data.medicine_prescribed, data.pregnant_medicine, data.investigation, data.pregnant_investigation, data.important_note, data.pregnant_important_note, data.topic_id, data.prescription_id], function (err, res) {
                            if (err) {
                                result(err, null);
                            } else {
                                result(null, res);
                            }
                        }
                        );
                    } catch (error) {
                        console.log("Method:approveRequest,File:DoctorDashboardService.js--> " + error);
                    } finally {
                        dbaccess.closeConnection(connection);
                    }

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


    async getQuestionAnswersData(requestData, result) {
        const connection = dbaccess.openConnection();
        try {
            connection.query(queries.getQuestionAnswers, [requestData.test_name], function (err, res) {
                if (err) {
                    result(err, null);
                } else {
                    result(null, res);
                }
            }
            );
        } catch (error) {
            console.log("Method:getQuestionAnswersData,File:DoctorDashboardService.js--> " + error);
        } finally {
            dbaccess.closeConnection(connection);
        }
    }


    async getDoctorDashboardData(request, result) {
        const connection = dbaccess.openConnection();
        try {
            connection.query(`${queries.getDoctorDashboardList};${queries.getCurrentDateListCount};${queries.getCurrentWeekListCount}`, [request.assigned_doctor_id, request.assigned_doctor_id, request.assigned_doctor_id, request.assigned_doctor_id, request.assigned_doctor_id], function (err, res) {
                if (err) {
                    result(err, null);
                } else {
                    let response;
                    response = {
                        list: res[0],
                        today_count: res[1][0],
                        week_count: res[2][0]
                    }
                    result(null, response);
                }
            }
            );
        } catch (error) {
            console.log("Method:getDoctorDashboardData,File:DoctorDashboardService.js--> " + error);
        } finally {
            dbaccess.closeConnection(connection);
        }
    }


    async updateConsultationStatus(overdueArray, result) {
        const connection = dbaccess.openConnection();
        var result;
        try {
            connection.query(queries.updateConsultationDueStatus, [overdueArray], function (err, res) {
                if (err) {
                    result(err, null);
                } else {
                    result(null, res);
                }
            }
            );
        } catch (error) {
            console.log("Method:updateConsultationStatus,File:DoctorDashboardService.js--> " + error);
        } finally {
            dbaccess.closeConnection(connection);
        }
    }

    //get patient Consultations list
    async getPatientConsultationList(result) {
        const connection = dbaccess.openConnection();
        var result;
        try {
            connection.query(queries.getDoctorDashboardList, function (err, res) {
                if (err) {
                    result(err, null);
                } else {
                    let response;

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

    async getPatientContactDetailsFromMongoDB(userInfo, result) {
        var responseArray = [];
        let O_id = new ObjectId(userInfo.patient_id);
        let reqSeq = {
            collection: "userdetails",
            userid: O_id,
            key: "_id"
        }
        try {
            let res_mongodb = await this.getUserDetailsFromMongoDB(reqSeq);
            if (res_mongodb.status == 200) {
                result(null, res_mongodb.data);
            }
            else {
                result(res_mongodb.data, null);
            }

        } catch (error) {
            console.log("Method:getPatientContactDetailsFromMongoDB,File:DoctorDashboardService.js--> " + error);
            result(error, null);
        }
    }


    //Functions
    async getUserDetailsFromMongoDB(req) {
        try {
            var Mongo = dbaccess.openMongoDBConnection();
            var FindData = await Mongo.db(process.env.DBNAME).collection(req.collection).find({ [req.key]: req.userid }).toArray();
            if (FindData.length > 0) {
                return ({ status: 200, message: "success", data: FindData });
            }
            return ({ status: 400, message: "No data was found in the database" });
        } catch (error) {
            throw error
        }
    }

    async getUserDetailsFromMysql(req, callback) {
        const connection = dbaccess.openConnection();
        try {
            connection.query(queries.checkUserQuery, [req.prescription_id], async function (error, FindData) {
                if (FindData.length > 0) {
                    callback({ status: 200, message: "success", data: FindData });
                }
                else {
                    callback({ status: 400, message: "No data was found in the database" });
                }
            })
        }
        catch (error) {
            console.log("Method:getUserDetailsFromMysql,File:services\DoctorDashboardService.js--> " + error);
        }
        finally {
            dbaccess.closeConnection(connection);
        }
    }



    async splitMedicineData(medData, callback) {
        var tempMedDatamedData = medData.split('||');
        var splitArray = [];
        var temp;
        tempMedDatamedData.forEach((ele) => {
            temp = ele.split('||');
            splitArray.push(temp[0].split('#dose'))
        })
        callback(splitArray);
    }

    static async getQuestionAnswersObject(responseObj, callback) {
        let tempQuestionArray = responseObj.split('||').map(value => (JSON.parse(value).QID))
        let tempAnswerMapArray = responseObj.split('||').map(value => ({ QID: JSON.parse(value).QID, ID: JSON.parse(value).ID }))

        try {
            const connection = dbaccess.openConnection();
            connection.query(queries.getQuestionAnswersObjectQuery, [tempQuestionArray], async function (error, res_questions) {
                if (error) {
                    // return ({ status: 502, message: "error", respText: error.message });
                    callback([])

                }
                else {
                    if (res_questions.length) {
                        let questionsTemp = res_questions.map(value => ({
                            question_id: value.question_id,
                            question: value.doc_question,
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
