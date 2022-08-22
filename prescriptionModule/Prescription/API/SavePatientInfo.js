var mongo = require('mongodb');
const moment = require('moment-timezone');
const knex = require("../../Database/MySqlConnection");
// const MongoConnect = require("../../Database/MongoConnection");

async function SavePatientInfo(req, res) {
    try {
        if(req.pres_id===null||req.pres_id===undefined||req.pres_id===""){
            return({status: 400, message: "pres_id is required"});
        }else{
            var PatientAge = moment().diff(moment(req.dob,"DD-MM-YYYY"), 'years',false);
            let response = await knex('pres_personaldata').select().where({pres_id:req.pres_id});
            if(response.length===0){
                await knex('pres_personaldata').insert({
                    pres_id: req.pres_id,
                    person_name: req.person_name,
                    dob: req.dob,
                    age: PatientAge,
                    height: req.height,
                    weight: req.weight,
                    sex: req.sex,
                    bmi: req.bmi,
                    email: req.email,
                    phone: req.phone
                })
                return({status: 200, message: "success"})
            }else{
                return({status: 400, message: "Prescription ID: "+req.pres_id+" already exist."})
            }
        }
    } catch (error) {
        console.log(error)
        return ({ status: 400, message: error.message });
    }
}
exports.processInput = SavePatientInfo;
