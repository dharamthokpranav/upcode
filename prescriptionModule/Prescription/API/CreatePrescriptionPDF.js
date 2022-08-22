var mongo = require('mongodb');
const AWS = require('aws-sdk');
var ObjectId = require('mongodb').ObjectID;
const moment = require('moment-timezone');
var PdfPrinter = require('pdfmake');
const htmlToPdfmake = require("html-to-pdfmake");
let jsdom = require("jsdom");
const knex = require("../../Database/MySqlConnection");
const MongoConnect = require("../../Database/MongoConnection");
const dbaccess = require("../../../database/dbaccess");
const queries = require("../../../database/queries");
const sendEmail = require('../../../utils/CommomFunctions');
const {email_Subject,email_body} = require('../../../utils/constants');
let { JSDOM } = jsdom;
let { window } = new JSDOM("");

async function CreatePrescriptionPDF(req, res) {
    try {
        
       if(true &&  req.diagnosisId===undefined||req.prescriptionId===undefined||req.patientId===undefined){
            return ({ status: 400, message: "diagnosisId, prescriptionId and patientId is required..." });
        }else{
            let MyPromise = new Promise((resolve, reject) => {
                getDataForPDF({diagnosis_id:req.diagnosisId,prescription_id:req.prescriptionId,patient_id:req.patientId},function(response, error){
                    if(error){
                        reject({status:400, message:error.message})
                    }else{
                        resolve(response);
                    }
                })
            });
            return await MyPromise.then(
                async function(data) {
                    if(data.length>0){
                        let DataObject = {
                            ID: data[0].dignosis.ID,
                            diagnosis_id: data[0].dignosis.diagnosis_id,
                            diagnosis: data[0].dignosis.diagnosis,
                            topic_id: data[0].dignosis.topic_id,
                            priliminary_diagnosis: data[0].dignosis.priliminary_diagnosis,
                            important_note: data[0].dignosis.important_note
                        }
                        // let DataObject = data[0];
                        for(let i=1; i<data.length; i++){
                            DataObject = {...DataObject,...data[i]}
                        }
                        return(await GeneratePrescriptionPDF(DataObject));
                        // return({status: 200, message: "success", Filepath:Filepath, Data:DataObject})
                    }else{
                        return({status: 200, message: "Data Not Found"})
                    }
                },
                function(error) { return({status:400, message:error.message}) }
            );
        }
    } catch (error) {
        console.log(error)
        return ({ status: 400, message: error.message });
    }
}
exports.processInput = CreatePrescriptionPDF;


async function getDataForPDF(reqInfo,callback){
    try{
        var responseArray = [];
        let patientInfo = await knex.raw("select * from pres_personaldata where pres_id=?",[reqInfo.prescription_id])
        patientInfo = patientInfo.length>0?patientInfo[0].length>0?patientInfo[0][0]:"":"";
        let O_id = new ObjectId(reqInfo.patient_id);
        let reqData = {
            collection: "userdetails",
            query:{_id: O_id},
            Project:false,
            Limit:false
        }
        let Response = await MongoConnect.GetAccess(reqData);
        // console.log(Response)
        if(Response.length>0){
            if(typeof(patientInfo)==="object"){
                patientInfo.lmp_date=Response[0].lastPeriodsDate;
            }
            const connection = dbaccess.openConnection();
            connection.query(queries.getPatientConsultaion, [reqInfo.diagnosis_id, reqInfo.prescription_id], async function (err, res_mysql) {
                // console.log(res_mysql)
                if (err) {
                    callback(err);
                } else {
                    if (res_mysql.length != 0) {
                        var promiseQuestionAnswer, promiseMedicalHistory
                        if (res_mysql[0].question_ans != null && res_mysql[0].question_ans != "") {
                            promiseQuestionAnswer = new Promise((resolve, reject) => {
                                getQuestionAnswersObject(res_mysql[0].question_ans, function (resultObj) {
                                    resolve(resultObj);
                                })
                            });
                        }
                        if (res_mysql[0].medical_history != null && res_mysql[0].medical_history != "") {
                            promiseMedicalHistory = new Promise((resolve, reject) => {
                                getQuestionAnswersObject(res_mysql[0].medical_history, function (resultObj) {
                                    resolve(resultObj);
                                })
                            });
                        }
                        Promise.all([promiseQuestionAnswer, promiseMedicalHistory]).then(data => {
                            delete res_mysql[0].question_ans;
                            delete res_mysql[0].medical_history;
                            responseArray.push({ dignosis: res_mysql[0] }, { patient_info: patientInfo }, { chief_complaints: typeof data[0] !== 'undefined' ? data[0] : [] }, { medical_history: typeof data[1] !== 'undefined' ? data[1] : [] })
                            if (res_mysql[0].is_pregnant == '1') {
                            // var substring_medicene=res_mysql[0].medicine_prescribed.split('||').length == 0 ? [res_mysql[0].medicine_prescribed] : res_mysql[0].medicine_prescribed.split('||');
                                responseArray.push({ investigation: res_mysql[0].pregnant_investigation ? (res_mysql[0].pregnant_investigation.split('||').length == 0 ? [res_mysql[0].pregnant_investigation] : res_mysql[0].pregnant_investigation.split('||')) : ["NA"] })
                                if(res_mysql[0].medicine_prescribed != ""){
                                    responseArray.push({medicene_prescribed: res_mysql[0].pregnant_medicine.split('||').length == 0 ? [res_mysql[0].pregnant_medicine] : res_mysql[0].pregnant_medicine.split('||') })
                                }else{
                                    responseArray.push({ medicene_prescribed: [] })
                                }
                            } else if (res_mysql[0].is_pregnant == '0') {
                                responseArray.push({ investigation: res_mysql[0].investigation ? (res_mysql[0].investigation.split('||').length == 0 ? [res_mysql[0].investigation] : res_mysql[0].investigation.split('||')) : ["NA"] })
                                responseArray.push({ medicene_prescribed: res_mysql[0].medicine_prescribed.split('||').length == 0 ? [res_mysql[0].medicine_prescribed] : res_mysql[0].medicine_prescribed.split('||') })
                            }
                            responseArray.push({ medicene_note: "note" })
                            callback(responseArray);
                            // Promise.resolve(responseArray)
                        }).catch(error => {
                            console.log(error)
                            // Promise.resolve("responseArray")
                        })
                    }
                }
            })
            dbaccess.closeConnection(connection);
        }else{
            callback ({ status: 400, message: "Invalid Patient ID" });
        }
    } catch (error) {
        console.log(error)
        callback({ status: 400, message: error.message });
    }
}

async function getQuestionAnswersObject(responseObj, callback){
    try {
        let tempQuestionArray = responseObj.split('||').map(value => (JSON.parse(value).QID))
        let tempAnswerMapArray = responseObj.split('||').map(value => ({ QID: JSON.parse(value).QID, ID: JSON.parse(value).ID }))
        const connection = dbaccess.openConnection();
        connection.query(queries.getQuestionAnswers, [tempQuestionArray], async function (error, res_questions) {
            if (error) {
                callback([])
            } else {
                if (res_questions.length) {
                    let questionsTemp = res_questions.map(value => ({
                        question_id: value.question_id,
                        question: value.doc_question,
                        answer: JSON.parse('[' + value.options + ']').find(({ ID }) => ID === tempAnswerMapArray.find(({ QID }) => QID === value.question_id).ID).Option,
                    }))
                    responseObj = questionsTemp
                }
                // console.log("function response", responseObj)
                callback(responseObj)
            }
        })
    } catch (error) {
        callback({ status: 400, message: error.message})
        console.log("CreatePrescriptionPDF.js--> " + error);
    }
}

async function GeneratePrescriptionPDF(data){
    try{

        
        let PresPdfData = [];
        PresPdfData.push(({image:"assests/logo.png",height:40,width:110}));

        PresPdfData.push({text:"Registered Medical Practioner's Name: ",margin: [ 350, -55, 0, 0 ]});
        PresPdfData.push({text:"Qualification: ", margin: [ 350, 0, 0, 0 ]});
        PresPdfData.push({text:"Registration No: ", margin: [ 350, 0, 0, 0 ]});
        PresPdfData.push({text:"Address: ", margin: [ 350, 0, 0, 0 ]});
        PresPdfData.push({text:"Ph. No: ", margin: [ 350, 0, 0, 0 ]});

        PresPdfData.push({text:"Date of consultation: "+ moment(data.patient_info.registered).format("LLLL"), margin:[0, 10, 0, 0 ]}); //,style:'nameStyle2'
        PresPdfData.push({text:"Name of the patient: "+data.patient_info.person_name});
        PresPdfData.push({text:"Gender: "+data.patient_info.sex});
        PresPdfData.push({text:"Address: "+data.patient_info.address});
        PresPdfData.push({text:"Age: "+data.patient_info.age});
        PresPdfData.push({text:"Height (in feet): "+data.patient_info.height});
        PresPdfData.push({text:"Weight (kg): "+data.patient_info.weight});
        PresPdfData.push({text:"Last Menstrual Period (LMP): "+data.patient_info.lmp_date});

        PresPdfData.push({text:"Preliminary diagnosis: ",margin:[0, 10, 0, 0 ], bold:true});
        PresPdfData.push({text: data.priliminary_diagnosis});
        PresPdfData.push({text:"Medicine to be taken (Rx)",margin:[0, 10, 0, 0 ], bold:true});
        let MedicineData = []
        for(let m=0; m<data.medicene_prescribed.length; m++){
            const Medicine = data.medicene_prescribed[m].split("#doseage");
            MedicineData.push({stack: Medicine})
        }
        PresPdfData.push({ul: MedicineData})
        PresPdfData.push({text:"Investigations advised",margin:[0, 10, 0, 0 ], bold:true});
        PresPdfData.push({ul: data.investigation});
        PresPdfData.push({text:"Chief Complaints",margin:[0, 10, 0, 0 ], bold:true});
        let ChiefComplaints = [];
        for(let c=0; c<data.chief_complaints.length; c++){
            ChiefComplaints.push({stack: [data.chief_complaints[c].question,data.chief_complaints[c].answer]})
        }
        PresPdfData.push({ol: ChiefComplaints});
        PresPdfData.push({text:"Medical History",margin:[0, 10, 0, 0 ], bold:true});
        let MedicalHistory = [];
        for(let h=0; h<data.medical_history.length; h++){
            MedicalHistory.push({stack: [data.medical_history[h].question,data.medical_history[h].answer]})
        }
        PresPdfData.push({ol: MedicalHistory});
        PresPdfData.push({text:"Important note: ",pageBreak: 'before', color:"red", bold:true, margin:[0, 10, 0, 0 ]});
        PresPdfData.push(htmlToPdfmake(data.important_note, {window: window}))

        PresPdfData.push({text:"Doctor’s Signature & Stamp", margin: [350, 40, 0, 0 ], bold:true});
        PresPdfData.push({image:"assests/stamp.png",height:40,width:140,margin: [350, 0, 0, 0 ]}) //style:"centerAllignment",


        var fonts = {
            AddedFonts: {
                normal: 'fonts/Assistant/static/Assistant-Light.ttf',
                italics: 'fonts/Roboto-LightItalic.ttf',
                bold: 'fonts/Assistant/static/Assistant-SemiBold.ttf'
            }
        };
        var printer = new PdfPrinter(fonts);

        var docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'portrait', //'landscape',
            pageMargins: [40,40,40,40],
            content: PresPdfData,
            defaultStyle: {
                font: 'AddedFonts'
            },
            styles: {
                nameStyle: {
                    fontSize: 20,
                    alignment: 'center'
                },nameStyle1: {
                    fontSize: 16,
                    alignment: 'center'
                },nameStyle2: {
                    fontSize: 14
                },centerAllignment: {
                    alignment: 'center'
                },
                achivedText: {
                    fontSize: 30,
                }
            }
        };
        // let FileWithPath = "./prescriptionPDFs/";
        // let FilePath_with_Name = FileWithPath+"prescription"+data.ID+".pdf";
        // await fs.mkdirSync(FileWithPath,{recursive:true});
        // var pdfDoc = await printer.createPdfKitDocument(docDefinition);
        // await pdfDoc.pipe(fs.createWriteStream(FilePath_with_Name));
        // await pdfDoc.end();

        let buffers = [],AwsS3FilePath=null;
        var pdfDoc = await printer.createPdfKitDocument(docDefinition);
        console.log("Started")
        pdfDoc.on('data', buffers.push.bind(buffers));
        console.log("Completed buffer creation")
        pdfDoc.on('end', async() => {
            console.log("AT END");
            let pdfData = await Buffer.concat(buffers);
            UploadToS3(pdfData,"prescription"+data.ID+".pdf",data.ID); //AwsS3FilePath
        })
        pdfDoc.end();
        console.log("Completed");

        var emailData={
            // recipientEmail:"dharamthokpranav@gmail.com",
            recipientEmail:[data.email,process.env.REEMASHAHEMAILID],
            patientname:data.patient_info.person_name,
            doctorname:"Sam",
            pinkypromisephone: process.env.PINKYPROMISEPHONE,
            pdfPath: process.env.PDFPATH+data.ID+".pdf"
        }
        let email_body_formatted= email_body.replace( '[PLACEHOLDER_NAME]', emailData.patientname).replace( '[PLACEHOLDER_DOCTORNAME]', emailData.doctorname).replace( '[PLACEHOLDER_PHONE]', emailData.pinkypromisephone);  
        let email_Subject_formatted= email_Subject.replace( '[PLACEHOLDER_SUBJECT]', emailData.doctorname);
        await sendEmail(email_Subject_formatted,email_body_formatted,emailData);
        // console.log("create ticket");
        // send email
        // 
        // sendEmail(email_Subject,email_body,'dharamthokpranav@gmail.com');
        return({status: 200, message: "success", FileUrl:process.env.PDFPATH+data.ID+".pdf"});
    } catch (error) {
        return({ status: 400, message: error.message})
    }
}

async function UploadToS3(prescriptionFile,FileName,pres_id){
    console.log(FileName)
    const blob = prescriptionFile;
    const s3 = new AWS.S3({
        accessKeyId: "AKIA2IDHZGFKGOY3MDPN",
        secretAccessKey: "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",
    })
    const uploadedImage = await s3.upload({
        Bucket: "pinkypromisedev-prescriptionreports",
        Key: FileName,
        Body: blob //prescriptionFile,
    }).promise()
    if(typeof(uploadedImage)==="object"){
        if(uploadedImage.Location!==undefined){
            knex('pres_personaldata').update({
                prescription_file: uploadedImage.Location
            }).where({pres_id:pres_id}).catch(function(e) {
                console.log(e)
            });
            return uploadedImage.Location;
        }
    }else{
        return null;
    }
}