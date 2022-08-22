const moment = require('moment-timezone');
const Razorpay = require("razorpay");
const knex = require("../../Database/MySqlConnection");
const fresh = require("../../../controllers/FreshController");
const commonOprations = require('../../../utils/CommomFunctions');
// const sendPushNotification = require('../../../utils/CommomFunctions');
// const MongoConnect = require("../../Database/MongoConnection");


const RazorpayKeyId= process.env.ENVMODE=='dev'? process.env.STAGERAZORPAYKEYID:process.env.LIVERAZORPAYKEYID;
const RazorpayKeySecret= process.env.ENVMODE=='dev'? process.env.STAGERAZORPAYKEYSECRET:process.env.LIVERAZORPAYKEYSECRET;

// console.log(process.env.STAGERAZORPAYKEYID, process.env.STAGERAZORPAYKEYSECRET)
const instance = new Razorpay({ key_id: RazorpayKeyId, key_secret: RazorpayKeySecret })
// Payment Pending || Payment Failed || Order Cancelled || Order Confirmed

async function presPaymentsCreateOrder(req, res) {
    // fresh.createTickets(ticketData,(err,success)=>{
    //     if(err){
    //         console.log(err);
    //     }
    //     if(success){
    //         console.log(success);
    //     }
    // })
    
    try {
        if((req.userId===null||req.userId===undefined||req.userId==="")||(req.presId===null||req.presId===undefined||req.presId==="")||(req.testId===null||req.testId===undefined||req.testId==="")){
            return({status: 400, message: "pres_id is required"});
        }else{
            let CheckOrders = await knex('pres_test_payments').select("id","order_id","order_placed","pres_id","test_id","user_id").where({test_id:req.testId,pres_id:req.presId,user_id:req.userId});
            if(CheckOrders.length===0){
                let CurrTimeStamp = moment().tz("Asia/Colombo").format();
                let response = await knex('labtests_master').select("amount","id").where({id:req.testId});
                if(response.length>0){
                    response = response[0];
                    let amount = Number.isInteger(response.amount)?response.amount:parseInt(response.amount);
                    var options = {
                        amount: amount*100,
                        currency: "INR",
                        receipt: "order_rcptid_"+req.presId,
                        payment: {
                            capture : 'automatic',
                            capture_options : {
                                automatic_expiry_period : 12,
                                manual_expiry_period : 7200,
                                refund_speed : 'optimum'
                            }
                        }
                    };
                    let OrderResp = await instance.orders.create(options);
                    if(typeof(OrderResp.error)==="object"){
                        return({status: 400, message: "Razorpay: "+OrderResp.error.description})
                    }else{
                        await knex('pres_test_payments').insert({
                            order_id: OrderResp.id,
                            order_placed: CurrTimeStamp,
                            pres_id: req.presId,
                            status: "Payment Pending",
                            test_id: req.testId,
                            user_id: req.userId
                        })
                        return({ status: 200, message: "success", ID:response.id, OrderID: OrderResp.id, Data: OrderResp })
                    }
                }else{
                    return({status: 400, message: "Lab Test ID Required....!!"})
                }
            }else{
                return({status: 300, message: "Order Already Created", Info:CheckOrders[0]})
            }
        }
    } catch (error) {
        console.log(error)
        if(typeof(error.error)==="object"){
            return({status: 400, message: "Razorpay: "+error.error.description})
        }else{
            return ({ status: 400, message: error.message });
        }
    }
}

async function presPaymentsConfirmation(req, res) {
   
    try {
        var  Response={};
        var doctorIdforNotification;
        if(req.PaymentId!==""&&req.PaymentId!==undefined && req.ID!==""&&req.ID!==undefined && req.orderId!==""&&req.orderId!==undefined && req.userId!==""&&req.userId!==undefined){
            let CurrTimeStamp = moment().tz("Asia/Colombo").format();
            Response.status = "captured";//await instance.payments.fetch(req.PaymentId);
            if(Response.status === "authorized" && req.PaymentId === Response.id){
                Response = await instance.payments.capture(Response.id, Response.amount, Response.currency);
            }
            if(Response.error){
                return({status:400,message:"Error",data:Response.error});
            }else if(Response.status === "captured" || Response.status === "authorized"){
                
                let response = await knex.select('*')
                .from('pres_data')
                .innerJoin('pres_personaldata', 'pres_data.ID', '=' ,'pres_personaldata.pres_id')
                .innerJoin('pres_test_payments', 'pres_data.ID', '=' , 'pres_test_payments.pres_id')
                .innerJoin('doctor_details','pres_data.assigned_doctor_id','=','doctor_details.doctor_id')
                .where('pres_data.user_id', '=', req.userId)
                console.log(response);


                doctorIdforNotification=response[0].doctor_id;
                var ticketData={"description": "This ticket is created for backend test","email": "samuser3010@gmail.com","priority": 1,"status": 2, "subject": "Backend Testing","group_id":88000027510, 
                "custom_fields" : { 
                    "cf_doctor_assigned_name":response[0].first_name+" "+response[0].last_name,
                    "cf_payment_amount":parseFloat(response[0].paid_amount),
                    "cf_payment_status":response[0].status,
                    "cf_name":response[0].person_name,
                    // "cf_timestamp_when_doctor_has_approved_prescription":"",
                    "cf_dob": moment(response[0].dob,'DD-MM-YYYY').format('YYYY-MM-DD'),
                    "cf_height":response[0].height,
                    "cf_bmi":response[0].bmi,
                    "cf_email":response[0].email,
                    "cf_phone_number":response[0].phone,
                    "cf_weight" : response[0].weight,
                    "cf_prescription_status":response[0].doctor_status=="Approved"?"Approved":"Request Received",
                    //these fields belongs to ptahology
                    // "cf_tests_booked_name_of_tests":"",
                    // "cf_status_of_the_test":"",
                    // "cf_test_amount_paid":"",
                    // "cf_time_and_date_of_test":"",
                    // "cf_address":"",
                } };

                
                var ticketPromise = new Promise(async (resolve, reject) => {
                    var response=await fresh.createTickets(ticketData)
                    resolve(response);
                }).catch((err)=>{
                    reject(err);
                })

                var pushNotificationPromise = new Promise(async (resolve, reject) => {
                    let object= new commonOprations();
                    let device_token = await knex.select('device_token').from('doctor_details').where('doctor_id', '=', doctorIdforNotification)
                    if(device_token != ""){
                        let data={devicetoken:device_token}
                    let notification_response= object.sendPushNotification(device_token);
                    resolve(notification_response);
                    }
                    else{
                    reject(notification_response);    
                    }
                }).catch((err)=>{
                    reject(err);
                })

                ticketPromise.then((data)=>{
                    console.log(data)
                })
                // store to user pres table
                // email to doctors and patients
                
                return await knex("pres_test_payments").update({payment_id:req.PaymentId, paid_amount:Response.amount/100, payment_captured:CurrTimeStamp, status:"Order Confirmed"}).where({id:req.ID, order_id:req.orderId, user_id:req.userId}).then(function(response){
                    return({ status: 200, message: "success"})
                }).catch(function(error){
                    console.log(error)
                    return ({ status: 400, message: error.message });
                })
            }
        }else{
            return ({ status: 400, message: "Request parameters are missed..!!" });
        }
    
    } catch (error) {
        console.log(error)
        if(typeof(error.error)==="object"){
            return({status: 400, message: "Razorpay: "+error.error.description})
        }else{
            return ({ status: 400, message: error.message });
        }
    }
}
module.exports = {
    presPaymentsCreateOrder,
    presPaymentsConfirmation
};
