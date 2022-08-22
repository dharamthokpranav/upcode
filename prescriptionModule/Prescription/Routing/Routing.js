const getPrescriptionQuestions = require('../API/getPrescriptionQuestions');
const StorePrescriptionData = require("../API/StorePrescriptionData");
const assignDoctor = require("../API/StorePrescriptionData");
const CreatePrescriptionPDF = require("../API/CreatePrescriptionPDF");
const SavePatientInfo = require("../API/SavePatientInfo");
const presPayments = require("../API/presPayments");
async function Routing(req,res){
    try{
        console.log((req.path).split("/").pop())
        let func = null;
        switch((req.path).split("/").pop()){
            case "getPrescriptionQuestions":
                func = getPrescriptionQuestions.processInput;
                break;
            case "StorePrescriptionData":
                func = StorePrescriptionData.processInput;
                break;
            case "SavePatientInfo":
                func = SavePatientInfo.processInput;
                break;
            case "CreatePrescriptionPDF":
                func = CreatePrescriptionPDF.processInput;
                break;    
            case "CreateLabTestOrder":
                func = presPayments.presPaymentsCreateOrder;
                break;
            case "LabTestPaymentConfirmation":
                func = presPayments.presPaymentsConfirmation;
                break;


                /////test

                case "checkdata":
                func = assignDoctor.processInput;
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