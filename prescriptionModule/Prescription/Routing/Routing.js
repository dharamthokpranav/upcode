const getPrescriptionQuestions = require('../API/getPrescriptionQuestions');
const StorePrescriptionData = require("../API/StorePrescriptionData");

async function Routing(req,res){
    try{
        let func = null;
        switch((req.path).split("/").pop()){
            case "getPrescriptionQuestions":
                func = getPrescriptionQuestions.processInput;
                break;
            case "StorePrescriptionData":
                func = StorePrescriptionData.processInput;
                break;
            default:
                func = null;
                break;
        }
        let processResponse = await func(req.body,res);
        res.send(processResponse);
    }catch(error){
        console.log(error.message)
        res.send({status:500,message:"Invalid API Endpoint"});
    }
}
exports.Routing=Routing;