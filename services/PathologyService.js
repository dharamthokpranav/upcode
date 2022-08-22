const DoctorDashboardService = require("./DoctorDashboardService");
var ObjectId = require('mongodb').ObjectID;

class pathologyService {

    constructor() { }



    async getPatientData(userInfo, result) {
        const connection = dbaccess.openConnection();
        try {
            let object = new DoctorDashboardService();
            let O_id = new ObjectId(userInfo.patient_id);
            let reqSeq={
                collection:"userdetails",
                userid:O_id,
                key:"_id"
            }
            let res_mongodb = await object.getUserDetailsFromMongoDB(reqSeq)
            console.log(res_mongodb);

        } catch(error){
            console.log("Method:getPatientData,File:services/PathologyService.js--> " + error);

            console.log(err)
        }
    }



    async function(userInfo, result) {

            try {

            }
            catch (error) {
                console.log("Method:getPatientConsultationData,File:DoctorDashboardService.js--> " + error);
                result(error, null);
            }

        }




    }

    module.export=pathologyService;
