var mongo = require('mongodb');
const moment = require('moment-timezone');
const knex = require("../../Database/MySqlConnection");
const MongoConnect = require("../../Database/MongoConnection");

async function getPrescriptionQuestions(req, res) {
    try {
        let UserID = req.UserID;
        let QuestionID = req.QuestionID;
        let TopicID = req.TopicID;
        // console.log(TopicID)
        let Answers = req.SelectedOptions; //[{QID:15,ID:1}]
        let ConditionB10 = false;

        if (TopicID === 5) {
            if((QuestionID >= 7 && QuestionID <= 13) || QuestionID === 15){
                let data = Answers.filter(data=>{
                    return(
                        (data.QID===6 && (data.ID===1||data.ID===2||data.ID===3||data.ID===4||data.ID===5))
                    )
                })
                if(data.length === 0){
                    ConditionB10 = true
                    if(QuestionID<=13){
                        QuestionID = 14;
                    }else{
                        QuestionID =17;
                    }
                }
            }
            // console.log(QuestionID)
            if (QuestionID === 16) {
                let check = Answers.find(ele => ele.QID === 15 && ele.ID === 1);
                if (check) { 
                    console.log(check); 
                } else { 
                    let TwelveQue = Answers.find(ele => ele.QID === 6 && (ele.ID===6||ele.ID===7));
                    QuestionID = TwelveQue !== undefined?17:76;
                }
            }
            if (QuestionID === 17 && !ConditionB10) {
                let check = Answers.find(ele => ele.QID === 6 && (ele.ID === 6 || ele.ID === 7));
                if (check) { console.log(check); } else { QuestionID = 18 }
            }
            if (QuestionID === 18) {
                let check = Answers.find(ele => ele.QID === 17 && ele.ID === 2);
                if (check) { console.log(check); } else { QuestionID = 76 }
            }
            if (QuestionID === 21) {
                let check = Answers.find(ele => ele.QID === 20 && (ele.ID===2||ele.ID===3));
                if (check) { console.log(check); } else { QuestionID = 76 }
            }
            if (QuestionID === 22) {
                let check = Answers.find(ele => ele.QID === 21 && (ele.ID===2||ele.ID===3));
                if (check) { console.log(check); } else { QuestionID = 76 }
            }
            if (QuestionID === 23) {
                let check = Answers.find(ele => ele.QID === 22 && ele.ID === 1);
                if (check) { console.log(check); } else { QuestionID = 76 }
            }
            if(QuestionID === 76){
                let data = Answers.filter(data=>{
                    return(data.QID===6 && (data.ID===6 || data.ID===7))
                })
                if(data.length === 1){
                    return({respCode:2,nextRef:-1})
                }
                // // "If 1 = 3,4. 
                // // 2 = 1. 
                // // 3 = 1. 
                // // 4= 1 or 2
                // // 5 = 1. 
                // // 6 = 1. 
                // // 7 = 1. 
                // // 8 = 1. 
                // // 9 = 1. 
                // // 10 = 1 or 2. 
                // // 11 = 1 or 2. 
                // // 12 = 1 or 2  "
                // let data = Answers.filter(data=>{
                //     return(
                //         (data.QID===6 && (data.ID==="3,4")) || (data.QID===7 && data.ID===1) || 
                //         (data.QID===8 && data.ID===1) || (data.QID===9 && (data.ID===1||data.ID===2)) || 
                //         ((data.QID===10||data.QID===11||data.QID===12||data.QID===13||data.QID===14) && data.ID===1) || 
                //         ((data.QID===15||data.QID===16||data.QID===17) && (data.ID===1||data.ID===2))
                //     )
                // })
                // let bv = data.length===9?true:false;
                // //"If 1 = 2,3,4, 
                // //2 = 1, 4= 1 and/or 5 = 1, 6 = 1, 8 = 1, 
                // //3 = 2, 7 = 1 or 2 or 3, 9 = 1 or 2, 10 = 1 or 2., 11 = 1 or 2., 12 = 1 or 2, 14 = 1 or 2"
                // let bv_and_yeast_data = Answers.filter(data=>{
                //     return(
                //         (data.QID===6 && (data.ID==="2,3,4")) || (data.QID===8 && data.ID===2) || ((data.QID===7||data.QID===9||data.QID===10||data.QID===11||data.QID===13)&&data.ID===1) ||
                //         (data.QID===12 && (data.ID===1||data.ID===2||data.ID===3)) || (data.QID===14&&(data.ID===1||data.ID===2)) || 
                //         (data.QID===15&&(data.ID===1||data.ID===2)) || (data.QID===16&&(data.ID===1||data.ID===2)) || (data.QID===19&&(data.ID===1||data.ID===2))
                //     )
                // })
                // let bv_and_yeast = bv_and_yeast_data.length===12?true:false;
                // if(bv || bv_and_yeast){
                //     QuestionID = 76;
                // }else{
                //     return({respCode:2,nextRef:-1})
                // }
            }
            console.log(QuestionID)
            let Response = await knex.raw("select * from pres_questions where id=? and topic_id=?", [QuestionID, TopicID]);
            Response = Response[0];
            console.log(Response)
            if (Response.length > 0) {
                Response = Response[0];
                let Options = Response.options.split("},{");
                Options = Options.join("}||{")
                Options = Options.split("||")
                for (let i = 0; i < Options.length; i++) {
                    Options[i] = JSON.parse(Options[i]);
                }
                Response.options = Options;
                if (QuestionID === 20) {
                    // let getUserInfo = {
                    //     collection:"userdetails",
                    //     query:{_id: new mongo.ObjectID(UserID)},
                    //     Project:true,
                    //     ProjectData:{lastPeriodsDate:1,avgMenstrualCycle:1},
                    //     Limit:true,
                    //     LimitValue:1
                    // }
                    // let UserInfo = await MongoConnect.GetAccess(getUserInfo);
                    // UserInfo = UserInfo[0];
                    // console.log("UserInfo");
                    // console.log(UserInfo);
                    // if(UserInfo.lastPeriodsDate!==undefined&&UserInfo.avgMenstrualCycle!==undefined){
                    //     let nextDate = moment(UserInfo.lastPeriodsDate,"YYYY-MM-DD").add(UserInfo.avgMenstrualCycle,'days');
                    let lastPeriodDate = Answers.find(data=>data.QID===18)
                    let lastPeriodDateInput = "";
                    if(lastPeriodDate){
                        lastPeriodDateInput = lastPeriodDate.date
                    }
                    let duration = Answers.find(data=>data.QID===19)
                    if(duration){
                        var durationDays = duration.input;
                    }
                    // console.log(durationDays)
                    // if(UserInfo.avgMenstrualCycle!==undefined){
                        let nextDate = moment(lastPeriodDateInput,"YYYY-MM-DD").add(durationDays,'days');
                        // console.log("nextDate: "+nextDate)
                        let OvulationDate = nextDate.subtract(14,'days');
                        // console.log("OvulationDate: "+OvulationDate)
                        let date1 = OvulationDate.add(-3,'days').format("DD-MM-YYYY");
                        let date2 = OvulationDate.add(1,'days').format("DD-MM-YYYY");
                        let date3 = OvulationDate.add(1,'days').format("DD-MM-YYYY");
                        let date4 = OvulationDate.add(1,'days').format("DD-MM-YYYY");
                        let date5 = OvulationDate.add(1,'days').format("DD-MM-YYYY");
                        let date6 = OvulationDate.add(1,'days').format("DD-MM-YYYY");
                        let date7 = OvulationDate.add(1,'days').format("DD-MM-YYYY");
                        let dates = date1+","+date2+","+date3+","+date4+","+date5+","+date6+","+date7;
                        // console.log(dates)
                        // Did you notice this pinkish discharge or reddish/brownish on any of these days (display range of 7 days above)
                        Response.questions = Response.questions.replace('display range of 7 days above', dates)
                    // }
                }
                return (Response);
            } else {
                return ({ status: 404, message: "Invalid MessageID" });
            }
        } else if (TopicID === 1) {
            let whereClause = "id=? and topic_id=?";
            if (QuestionID === 29)
                whereClause = "id>=? and id<=48 and topic_id=?";
            if (QuestionID === 51)
                whereClause = "id>=? and id<=59 and topic_id=?";
            let Response = await knex.raw("select * from pres_questions where "+whereClause, [QuestionID, TopicID]);
            Response = Response[0];
            if (Response.length > 0) {
                for (let i = 0; i < Response.length; i++) {
                    let Options = Response[i].options.split("},{");
                    Options = Options.join("}||{")
                    Options = Options.split("||")
                    // console.log(Options)
                    for (let i = 0; i < Options.length; i++) {
                        Options[i] = JSON.parse(Options[i]);
                    }
                    Response[i].options = Options;
                }
                // console.log(Response);
                if (Response.length === 1)
                    return (Response[0]);
                if (QuestionID === 29)
                    return ({ MainQuestion: "Symptom screening", Questions: Response });
                if (QuestionID === 51)
                    return ({ MainQuestion: "Do you experience any of the following (select all that apply to you)", Questions: Response })
            } else {
                return ({ status: 404, message: "Invalid MessageID" });
            }
        }else if(TopicID===4){
            // if(QuestionID===0||QuestionID===undefined){
            //     let Response = await getPrescriptionMessage.processInput({ResultId:46,TopicID:TopicID});
            //     return Response;
            // }
            let whereClause = "id=? and topic_id=?";
            if(QuestionID===69){
                whereClause = "id>=? and id<=74 and topic_id=?";
            }else{ // if(QuestionID===-1)
                let data = Answers.filter(data=>{
                    return(
                        ((data.QID===69&&data.ID===1)||((data.QID===71||data.QID===72||data.QID===73||data.QID===74)&&data.ID===2))
                    )
                })
                if(data.length===5){
                    QuestionID=75
                }else{
                    let breastFeedCheck = Answers.filter(data=>{return((data.QID===70&&data.ID===1)||((data.QID===71||data.QID===72||data.QID===73||data.QID===74)&&data.ID===2))});
                    if(breastFeedCheck.length === 5){
                        QuestionID=79
                    }else{
                        let CheckCondition = Answers.filter(data=>{
                            return(data.QID===69||data.QID===70||data.QID===71||data.QID===72||data.QID===73||data.QID===74)
                        })
                        // console.log(CheckCondition.length)
                        if(CheckCondition.length === 6){
                            return({"respCode": 2,"nextRef": -1});
                        }
                    }
                }
            }
            // console.log(whereClause)
            let Response = await knex.raw("select * from pres_questions where "+whereClause, [QuestionID, TopicID]);
            Response = Response[0];
            if (Response.length > 0) {
                for (let i = 0; i < Response.length; i++) {
                    let Options = Response[i].options.split("},{");
                    Options = Options.join("}||{")
                    Options = Options.split("||")
                    // console.log(Options)
                    for (let i = 0; i < Options.length; i++) {
                        Options[i] = JSON.parse(Options[i]);
                    }
                    Response[i].options = Options;
                }
                // console.log(Response);
                if (Response.length === 1)
                    return (Response[0]);
                if(Response.length > 1){
                    return ({ MainQuestion: "Thank you for telling me about your symptoms. Now I want to ask you a few questions about your medical history. This will help me understand what to prescribe to you", Questions: Response });
                }
            } else {
                return ({ status: 404, message: "Invalid MessageID" });
            }
        }
    } catch (error) {
        console.log(error)
        return ({ status: 400, message: error.message });
    }
}
exports.processInput = getPrescriptionQuestions;
