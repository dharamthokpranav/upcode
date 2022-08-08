const knex = require("../../Database/MySqlConnection");
const MongoConnect = require("../../Database/MongoConnection");
var mongo = require('mongodb');
const moment = require('moment-timezone');
async function StorePrescriptionData(req, res) {
    try {
        let UserID = req.UserID;
        let TopicID = req.TopicID;
        let Answers = req.SelectedOptions; //[{QID:15,ID:1}]
        let CheifComplaintQuestions = Answers.filter(data=>data.QType===1);
        let MedicalHistoryQuestions = Answers.filter(data=>data.QType===2);
        let questionsData = [];
        let questionsDataString = "";
        for (let i = 0; i < CheifComplaintQuestions.length; i++) {
            questionsData.push(JSON.stringify(CheifComplaintQuestions[i]));
        }
        questionsDataString = questionsData.join("||");
        let MedHistoryData = [];
        let MedHistoryDataString = "";
        for (let i = 0; i < MedicalHistoryQuestions.length; i++) {
            MedHistoryData.push(JSON.stringify(MedicalHistoryQuestions[i]));
        }
        MedHistoryDataString = MedHistoryData.join("||");
        if (TopicID === 5) {
            let isPregnent = Answers.find(ele => ele.QID === 5 && ele.ID === 1);
            let EndResultId = -1;
            if (isPregnent) {
                // Book appointment in person (schedule one now)
                EndResultId = 1;
            } else {
                // 6-15
                // "If 1 = 1 or 2. 2= 1 or 2. 3=1. 4,5,6 = 2. 7 = 2 or 3. 8,9,10 = 2."
                let FirstCheckData = Answers.filter(ele => {
                    return (
                        (ele.QID === 6 && (ele.ID === 1 || ele.ID === 2)) || //1
                        (ele.QID === 7 && (ele.ID === 1 || ele.ID === 2)) || //2
                        (ele.QID === 8 && ele.ID === 1) //3
                    )
                })
                let CheckData = Answers.filter(ele => {
                    return (
                        (ele.QID === 9 && ele.ID === 2) || (ele.QID === 10 && ele.ID === 2) || (ele.QID === 11 && ele.ID === 2) || //4,5,6
                        (ele.QID === 12 && (ele.ID === 2 || ele.ID === 3)) || //7
                        (ele.QID === 13 && ele.ID === 2) || (ele.QID === 14 && ele.ID === 2) || (ele.QID === 15 && (ele.ID===2||ele.ID===1))|| //8,9,10
                        (ele.QID === 16 && ele.ID === 2)
                    )
                });
                let CheckQuestion15 = Answers.filter(data=>data.QID===15);
                if (((CheckData.length + FirstCheckData.length) === 11 && CheckQuestion15[0].ID===1) || ((CheckData.length + FirstCheckData.length) === 10 && CheckQuestion15[0].ID===2)) {
                    // No infection
                    console.log("No infection")
                    EndResultId = 3;
                } else {
                    // "If 1 = 1 or 2
                    // 2 = 1 or 2
                    // 3 = 1 or 2
                    // 9 = 2
                    // and any one or more of 
                    // 4 = 1 
                    // 5= 1
                    // 6 = 1
                    // 8 = 1
                    // 10 = 1 or 2 and 11 = 1 or 2"
                    let SecondCheckData = Answers.filter(ele => {
                        return (
                            (ele.QID === 6 && (ele.ID === 1 || ele.ID === 2 || ele.ID===3)) || //1
                            (ele.QID === 7 && (ele.ID === 1 || ele.ID === 2)) || //2
                            (ele.QID === 8 && (ele.ID === 1 || ele.ID === 2)) || //3
                            (ele.QID === 14 && ele.ID === 2) //9
                        )
                    })
                    let CheckData1 = Answers.filter(ele => {
                        return (
                            ((ele.QID === 9 || ele.QID === 10 || ele.QID === 11 || ele.QID === 13) && ele.ID === 1) || //4,5,6,8
                            (ele.QID === 15 && (ele.ID === 1 || ele.ID === 2)) || //10
                            (ele.QID === 16 && (ele.ID === 1 || ele.ID === 2)) //11
                        )
                    });
                    let Condition56 = Answers.filter(data=>(data.QID===6 && data.ID===3)|| (data.QID===11 && data.ID!=2))
                    let isBv = Condition56.length===2?true:false;
                    let PossibleYeastCheck = Answers.filter(data=>{
                        return(
                            (data.QID===6||data.QID===8||data.QID===9||data.QID===10) && data.ID===2
                        )
                    })
                    let CheckYeast = Answers.filter(data=>{
                        return(
                            ((data.QID===6||data.QID===8||data.QID===11||data.QID===12)&&data.ID===2) || (data.QID===9&&data.ID===1)
                        )
                    })
                    let AllergicCheck = Answers.filter(ele => {
                        return (
                            (ele.QID === 6 && (ele.ID === 1 || ele.ID === 4)) ||
                            ((ele.QID === 8 || ele.QID === 15 || ele.QID === 16) && ele.ID === 1) ||
                            ((ele.QID===9||ele.QID===10||ele.QID===11||ele.QID===12||ele.QID===13)&&ele.ID===2)
                        )
                    });
                    let Question76 = Answers.find(data=>data.QID===76)

                    if (SecondCheckData.length === 4 && CheckData1.length > 0 && !isBv && PossibleYeastCheck.length!==4 && CheckYeast.length !== 5 && AllergicCheck.length !== 9 && Question76===undefined) {
                        // Vaginitis //EndResultId = 5;
                        // vaginitis + STI test // B51
                        // EndResultId = 5/6;
                        EndResultId = 5;
                        // console.log(AllergicCheck)
                        // if(){
                        //     EndResultId = 19; //Allergic
                        // }
                    } else {
                         // "If 1 = 1 or 2
                        // 2 = 1 or 2
                        // 3 = 1 or 2
                        // 9 = 1
                        // and any one or more of 
                        // 4 = 1 
                        // 5= 1
                        // 6 = 1
                        // 8 = 1
                        // 10 = 1 or 2 and 11 = 1 or 2"
                        let Vaginitis_and_sti = Answers.filter(ele => {
                            return (
                                (ele.QID === 6 && (ele.ID === 1 || ele.ID === 2 || ele.ID === 3)) || //1
                                (ele.QID === 7 && (ele.ID === 1 || ele.ID === 2)) || //2
                                (ele.QID === 8 && (ele.ID === 1 || ele.ID === 2)) || //3
                                (ele.QID === 14 && ele.ID === 1) //9
                            )
                        })
                        let CheckData1s = Answers.filter(ele => {
                            return (
                                ((ele.QID === 10||ele.QID === 11||ele.QID === 13||ele.QID === 14) && ele.ID === 1) || //4,5,6,8
                                (ele.QID === 15 && (ele.ID === 1 || ele.ID === 2)) ||
                                (ele.QID === 16 && (ele.ID === 1 || ele.ID === 2))
                            )
                        });
                        let Condition56 = Answers.filter(data=>(data.QID===6 && data.ID===3)|| (data.QID===11 && data.ID!=2))
                        let isBv = Condition56.length===2?true:false;
                        if (Vaginitis_and_sti.length === 4 && CheckData1s.length > 0 && !isBv && PossibleYeastCheck.length!==4 && CheckYeast.length !== 5 && AllergicCheck.length !== 9 && Question76===undefined) {
                            EndResultId = 6; //vaginitis + STI test
                        }else{
                            // "1 = 2 4
                            // 2 = 1 or 2  
                            // 3 = 2 
                            // And 
                            // 4 = 2
                            // 5 = 2 
                            // 6 = 2 or 1 
                            // 7 = 1 or 2 or 3 
                            // 8 = 1 or 2
                            // 9 = 1 or 2
                            // 10 = 1 or 2"
                            let CheckData1 = Answers.filter(ele => {
                                return (
                                    (ele.QID === 8 && ele.ID === 2) || //3
                                    (ele.QID === 6 && (ele.ID === 2 || ele.ID === 4)) || //1
                                    (ele.QID === 7 && (ele.ID === 1 || ele.ID === 2)) || //2
                                    (ele.QID === 9 && ele.ID === 2) || (ele.QID === 10 && ele.ID === 2) ||
                                    (ele.QID === 11 && (ele.ID === 1 || ele.ID === 2)) ||
                                    (ele.QID === 12 && (ele.ID === 1 || ele.ID === 2 || ele.ID === 3)) ||
                                    (ele.QID === 13 && (ele.ID === 1 || ele.ID === 2)) ||
                                    (ele.QID === 14 && (ele.ID === 1 || ele.ID === 2)) ||
                                    (ele.QID === 15 && (ele.ID === 1 || ele.ID === 2))
                                )
                            });
                            if (CheckData1.length === 10) {
                                EndResultId = 7; // "Possible yeast
                            } else {
                                // "1 = 2,4.
                                // 2 = 1 or 2
                                // 3 = 2. 
                                // 4 = 1. 
                                // 5 = 1 or 2 
                                // 6 = 2. 
                                // 7 = 2. 
                                // 8 = 1 or 2
                                // 9 = 1 or 2 "
                                // 10 = 1 or 2
                                // 11 = 1 or 2 "
                                let result6 = Answers.filter(ele => {
                                    return (
                                        (ele.QID === 6 && (ele.ID === 2 || ele.ID === 4)) || //1
                                        (ele.QID === 7 && (ele.ID === 1 || ele.ID === 2)) || //2
                                        (ele.QID === 8 && ele.ID === 2) || (ele.QID === 9 && ele.ID === 1) || //3,4
                                        (ele.QID === 10 && (ele.ID === 1 || ele.ID === 2)) || //5
                                        (ele.QID === 11 && ele.ID === 2) || (ele.QID === 12 && ele.ID === 2) || //6,7
                                        ((ele.QID===13||ele.QID===14||ele.QID===15||ele.QID===16) && (ele.ID === 1 || ele.ID === 2)) //8,9,10,11
                                    )
                                });
                                if (result6.length === 11) {
                                    EndResultId = 9; // Yeast
                                } else {
                                    // console.log("TESTINGb2")
                                    // "If 1 = 2,3,4
                                    // 2 = 1 
                                    // 3 = 2
                                    // 4= 1 and/or 5 = 1
                                    // 6 = 1
                                    // 7 = 1 or 2 or 3
                                    // 8 = 1 
                                    // 9 = 1 or 2
                                    // 10 = 1 or 2. 
                                    // 11 = 1 or 2. when 10=1
                                    // 14 = 1 or 2"
                                    let result14 = Answers.filter(ele => {
                                        return (
                                            (ele.QID === 6 && (ele.ID === 2 || ele.ID === 3 || ele.ID === 4)) || //1
                                            (ele.QID === 7 && ele.ID === 1) || //2
                                            (ele.QID === 8 && ele.ID === 2) || //3
                                            (ele.QID === 11 && ele.ID === 1) || (ele.QID === 12 && (ele.ID === 1||ele.ID === 2||ele.ID === 3)) || //6,7
                                            (ele.QID === 13 && ele.ID === 1) || //8
                                            (ele.QID === 14 && (ele.ID === 1 || ele.ID === 2)) || //9
                                            (ele.QID === 15 && (ele.ID === 1 || ele.ID === 2)) || //10
                                            (ele.QID === 16 && (ele.ID === 1 || ele.ID === 2)) || //11
                                            (ele.QID === 76 && (ele.ID === 1 || ele.ID === 2)) //14
                                        )
                                    });
                                    let ConCheck = Answers.find(data=>data.QID===15)
                                    ConCheck = ConCheck===undefined?{}:ConCheck;
                                    // "If 1 = 2,3,4
                                    // 2 =  1 or 2
                                    // 3 = 2
                                    // 4= 1 and/or 5 = 1
                                    // 6 = 1
                                    // 7 = 1 or 2 or 3
                                    // 8 = 1 or 2 (but 2 and 8 is not = 1)
                                    // 9 = 1 or 2
                                    // 10 = 1 or 2. 
                                    // 11 = 1 or 2. 
                                    // 14 = 1"
                                    let result141 = Answers.filter(ele => {
                                        return (
                                            (ele.QID === 6 && (ele.ID === 2 || ele.ID === 3 || ele.ID === 4)) || //1
                                            (ele.QID === 7 && (ele.ID === 1||ele.ID === 2)) || //2
                                            (ele.QID === 8 && ele.ID === 2) || //3
                                            (ele.QID === 11 && ele.ID === 1) || (ele.QID === 12 && (ele.ID === 1||ele.ID === 2||ele.ID === 3)) || //6,7
                                            (ele.QID === 13 && (ele.ID === 1||ele.ID === 2)) || //8
                                            (ele.QID === 14 && (ele.ID === 1 || ele.ID === 2)) || //9
                                            (ele.QID === 15 && (ele.ID === 1 || ele.ID === 2)) || //10
                                            (ele.QID === 16 && (ele.ID === 1 || ele.ID === 2)) || //11
                                            (ele.QID === 76 && ele.ID === 1) //14
                                        )
                                    });
                                    let Ques9 = Answers.find(data=>data.QID===9);
                                    Ques9 = Ques9===undefined?{}:Ques9;
                                    let Ques10 = Answers.find(data=>data.QID===10);
                                    Ques10 = Ques10===undefined?{}:Ques10;
                                    let bv_and_yeast = false;
                                    if((Ques9.ID===1&&Ques10.ID===1) || (Ques9.ID===1&&Ques10.ID===2) || (Ques9.ID===2&&Ques10.ID===1)){
                                        bv_and_yeast = true;
                                    }
                                    if(((result14.length > 9 || result141.length > 9) && ConCheck.ID===1)||((result14.length >= 9 || result141.length >= 9) && ConCheck.ID!==1 && bv_and_yeast)){
                                        EndResultId = 53; //BV + yeast(with FAS 3 Kit)
                                    }else{
                                        // "If 1 = 2,3,4
                                        // 2 = 1 or 2
                                        // 3 = 2
                                        // 4= 1 and/or 5 = 1
                                        // 6 = 1
                                        // 7 = 1 or 2 or 3
                                        // 8 = 1 or 2(but 2 and 8 is not = 1)
                                        // 9 = 2 or 1
                                        // 10 = 1 or 2. 
                                        // 11 = 1 or 2. only when 10=1
                                        // 14 = 2
                                        let result7 = Answers.filter(ele => {
                                            return (
                                                (ele.QID === 6 && (ele.ID === 2 || ele.ID === 3 || ele.ID === 4)) || //1
                                                (ele.QID === 7 && (ele.ID === 1 || ele.ID === 2)) || //2
                                                (ele.QID === 8 && ele.ID === 2) || //3
                                                (ele.QID === 11 && ele.ID === 1) || //6
                                                (ele.QID === 12 && (ele.ID === 1 || ele.ID === 2 || ele.ID === 3)) || //7
                                                (ele.QID === 13 && (ele.ID === 1 || ele.ID === 2)) || //8
                                                (ele.QID === 14 && (ele.ID === 1 || ele.ID === 2)) || //9
                                                (ele.QID === 15 && (ele.ID === 1 || ele.ID === 2)) || //10
                                                (ele.QID === 16 && (ele.ID === 1 || ele.ID === 2)) || //11
                                                (ele.QID === 76 && ele.ID === 2) //14
                                            )
                                        });
                                        let ConditionCheck = Answers.find(data=>data.QID===15)
                                        ConditionCheck = ConditionCheck===undefined?{}:ConditionCheck
                                        let check28 = Answers.filter(ele => {
                                            return (
                                                ((ele.QID === 7 || ele.QID === 13) && ele.ID === 1) //(but 2 and 8 is not = 1)
                                            )
                                        })
                                        if (((result7.length>=10&&ConditionCheck.ID===1) ||(result7.length>=9&&ConditionCheck.ID!==1)) && check28.length !== 2 && bv_and_yeast) {
                                            EndResultId = 10; // BV + yeast 
                                        } else {
                                            // "If 1 = 3,4. 
                                            // 2 = 1 or 2
                                            // 3 = 1. 
                                            // 4= 1 or 2
                                            // 5 = 1 or 2
                                            // 6 = 1. 
                                            // 7 = 1 or 2 or 3
                                            // 8 = 1 or 2
                                            // 9 = 1 or 2
                                            // 10 = 1 or 2. 
                                            // 11 = 1 or 2. 
                                            // 14=2"
                                            let result8 = Answers.filter(ele => {
                                                return (
                                                    (ele.QID === 6 && (ele.ID === 3 || ele.ID === 4)) || //1
                                                    (ele.QID === 7 && (ele.ID === 1 || ele.ID === 2)) || //2
                                                    (ele.QID === 8 && ele.ID === 1) || //3
                                                    (ele.QID === 9 && (ele.ID === 1||ele.ID === 2)) || (ele.QID === 10 && (ele.ID === 1||ele.ID === 2)) || (ele.QID === 11 && ele.ID === 1) || //4,5,6
                                                    (ele.QID === 12 && (ele.ID === 1 || ele.ID === 2 || ele.ID === 3)) || //7
                                                    (ele.QID === 13 && (ele.ID === 1 || ele.ID === 2)) || //8
                                                    (ele.QID === 14 && (ele.ID === 1 || ele.ID === 2)) || //9
                                                    (ele.QID === 15 && (ele.ID === 1 || ele.ID === 2)) || //10
                                                    (ele.QID === 16 && (ele.ID === 1 || ele.ID === 2)) || //11
                                                    (ele.QID === 76 && ele.ID === 2)//14
                                                )
                                            });
                                            // console.log(Answers)
                                            let Checkb65 = Answers.find(data=>data.QID===15&&data.ID===1)
                                            Checkb65 = Checkb65===undefined?{}:Checkb65;
                                            if ((result8.length === 12 && Checkb65.ID===1) || (result8.length === 11 && Checkb65.ID!==1)) {
                                                let BVFAS_Check = Answers.filter(data=>{
                                                    return(
                                                        (data.QID===7||data.QID===8||data.QID===11||data.QID===13)&&data.ID===1
                                                    )
                                                })
                                                if(BVFAS_Check.length === 4){
                                                    EndResultId = 54; // BV with FAS-3 kit
                                                }else{
                                                    EndResultId = 13; // BV
                                                }
                                            } else {
                                                // console.log("TESTING")
                                                // "If 1 = 3,4. 
                                                // 2 = 1. 
                                                // 3 = 1. 
                                                // 4= 1 or 2
                                                // 5 = 1 or 2 
                                                // 6 = 1. 
                                                // 7 = 1 or 2 or 3
                                                // 8 = 1
                                                // 9 = 1 or 2
                                                // 10 = 1 or 2. 
                                                // 11 = 1 or 2. 
                                                // 14 =  1 or 2"
                                                let result9 = Answers.filter(ele => {
                                                    return (
                                                        (ele.QID === 6 && (ele.ID === 3 || ele.ID === 4)) || //1
                                                        ((ele.QID===7||ele.QID===8||ele.QID===11||ele.QID===13) && ele.ID===1) || //2,3,6,8
                                                        ((ele.QID===9||ele.QID===10||ele.QID===14||ele.QID===15||ele.QID===16||ele.QID===76) && (ele.ID === 1 || ele.ID === 2)) || //4,5,9,10,11,14
                                                        (ele.QID === 12 && (ele.ID === 1||ele.ID === 2||ele.ID === 3))
                                                    )
                                                });
                                                // console.log("result9")
                                                // console.log(result9)
                                                // "If 1 = 3,4. 
                                                // 2 = 1 or 2
                                                // 3 = 1. 
                                                // 4= 1 or 2
                                                // 5 = 1 or 2
                                                // 6 = 1. 
                                                // 7 = 1 or 2 or 3
                                                // 8 = 1 or 2 but NO 2 =1 and 8 = 1 
                                                // 9 = 1 or 2
                                                // 10 = 1 or 2. 
                                                // 11 = 1 or 2. 
                                                // 14 = 1"
                                                let result911 = Answers.filter(ele => {
                                                    return (
                                                        (ele.QID === 6 && (ele.ID === 3 || ele.ID === 4)) || //1
                                                        ((ele.QID===8||ele.QID===11||ele.QID===76) && ele.ID===1) || //3,6,14
                                                        ((ele.QID===7||ele.QID===9||ele.QID===10||ele.QID===13||ele.QID===14||ele.QID===15||ele.QID===16||ele.QID===17) && (ele.ID === 1 || ele.ID === 2)) || //2,4,5,8,9,10,11,12
                                                        (ele.QID === 12 && (ele.ID === 1||ele.ID === 2||ele.ID === 3)) // 7
                                                    )
                                                });
                                                // console.log("result911")
                                                // console.log(result911)
                                                let check911 = Answers.filter(ele => {
                                                    return ((ele.QID===7||ele.QID===13) && ele.ID===1)
                                                });
                                                // console.log("check911")
                                                // console.log(check911)
                                                // ConCheck => Question15
                                                if (((result9.length === 12 || (result911.length === 12 && check911.length !== 2)) && ConCheck.ID===1) || ((result9.length === 11 || (result911.length === 11 && check911.length !== 2)) && ConCheck.ID!==1)) {
                                                    EndResultId = 54; //BV with FAS-3 kit
                                                } else {
                                                    // "1 = 5 or 2. 
                                                    // 2 = 1. 
                                                    // 4, 5, 6,7, 8, 9 = 1"
                                                    let result10 = Answers.filter(ele => {
                                                        return (
                                                            (ele.QID === 6 && (ele.ID === 2 || ele.ID === 5)) || //1
                                                            (ele.QID === 7 && ele.ID === 1) || //2
                                                            ((ele.QID === 9 || ele.QID === 10 || ele.QID === 11 || ele.QID === 12 || ele.QID === 13 || ele.QID === 14) && ele.ID === 1) //4,5,6,7,8,9
                                                        )
                                                    });
                                                    if (result10.length === 8) {
                                                        // Trich and STI test
                                                        EndResultId = 14;
                                                    } else {
                                                        // // "1 = 5 or 2. 
                                                        // // 2 = 1 or 2
                                                        // // 3 = 1 or 2
                                                        // // 9 = 1 
                                                        // // and any one of
                                                        // // 4, 5, 6,7, 8 = 1"
                                                        // let result11_1 = Answers.filter(ele => {
                                                        //     return (
                                                        //         (ele.QID === 6 && (ele.ID === 2 || ele.ID === 5)) || //1
                                                        //         (ele.QID === 7 && (ele.ID === 1 || ele.ID === 2)) || //2
                                                        //         (ele.QID === 8 && (ele.ID === 1 || ele.ID === 2)) || //3
                                                        //         (ele.QID === 14 && ele.ID === 1) //4
                                                        //     )
                                                        // });
                                                        // let result11_2 = Answers.filter(ele => {
                                                        //     return (
                                                        //         ((ele.QID === 9 || ele.QID === 10 || ele.QID === 11 || ele.QID === 12 || ele.QID === 13) && ele.ID === 1)
                                                        //     )
                                                        // });
                                                        // if (result11_1.length === 4 && result11_2.length > 0) {
                                                        //     EndResultId = 15; // Vaginitis + STI test
                                                        // } else {
                                                            // If 1 = 5 and  9 =1
                                                            let result12 = Answers.filter(ele => {
                                                                return (
                                                                    (ele.QID === 6 && ele.ID === 5) || //1
                                                                    (ele.QID === 14 && (ele.ID===1||ele.ID===2)) //9
                                                                )
                                                            });
                                                            if (result12.length === 2) {
                                                                EndResultId = 55; // Probable STI 
                                                            } else {
                                                                // "If 1 = 2, 2 = 1 and 3 = 1
                                                                // 4 = 2
                                                                // 5 =2 
                                                                // 6 =2
                                                                // 7 =2
                                                                // 8 = 1 or 2 
                                                                // 9 = 1"
                                                                let result13 = Answers.filter(ele => {
                                                                    return (
                                                                        (ele.QID === 6 && ele.ID === 2) || (ele.QID === 7 && ele.ID === 1) || (ele.QID === 8 && ele.ID === 1) || //1,2,3
                                                                        ((ele.QID === 9 || ele.QID === 10 || ele.QID === 11 || ele.QID === 12) && ele.ID === 2) ||
                                                                        (ele.QID === 13 && (ele.ID === 1 || ele.ID === 2)) ||
                                                                        (ele.QID === 14 && ele.ID === 1)
                                                                    )
                                                                });
                                                                if (result13.length === 9) {
                                                                    EndResultId = 17; // STI testing optional
                                                                } else {
                                                                    // "If 1 = 1 or 4. 
                                                                    // 2 = 1. 
                                                                    // 3 = 1. 
                                                                    // 10 = 1 and 
                                                                    // 11 = 1  "
                                                                    let result14 = Answers.filter(ele => {
                                                                        return (
                                                                            (ele.QID === 6 && (ele.ID === 1 || ele.ID === 4)) ||
                                                                            ((ele.QID === 8 || ele.QID === 15 || ele.QID === 16) && ele.ID === 1)
                                                                        )
                                                                    });
                                                                    if (result14.length === 4) {
                                                                        EndResultId = 19; // Allergic
                                                                    } else {
                                                                        // "1=6 or 7 and 12=1
                                                                        // and 12.1 = 2"   
                                                                        let result15 = Answers.filter(ele => {
                                                                            return (
                                                                                (ele.QID === 6 && (ele.ID === 6 || ele.ID === 7)) ||
                                                                                (ele.QID === 17 && ele.ID === 1) ||
                                                                                (ele.QID === 77 && ele.ID === 2)
                                                                            )
                                                                        });
                                                                        if (result15.length === 3) {
                                                                            EndResultId = 21; // Onset of periods or just after
                                                                        } else {
                                                                            // "1=6 or 7, 9 = 1 and 12=1
                                                                            // and 12.1 = 1"
                                                                            let result151 = Answers.filter(ele => {
                                                                                return (
                                                                                    (ele.QID === 6 && (ele.ID === 6 || ele.ID === 7)) ||
                                                                                    ((ele.QID === 14||ele.QID === 17||ele.QID === 77) && ele.ID === 1)
                                                                                )
                                                                            });
                                                                            if (result151.length === 4) {
                                                                                // "Onset of periods or just after with a milk case of infection also. STI test optional
                                                                                // If symptoms dont improve, then Pap Smear and Pelvic exam"
                                                                                EndResultId = 23;
                                                                            } else {
                                                                                // "1=6 or 7, 9 = 2 and 12=1
                                                                                // and 12.1 = 1"
                                                                                let result162 = Answers.filter(ele => {
                                                                                    return (
                                                                                        (ele.QID === 6 && (ele.ID === 6||ele.ID === 7)) ||
                                                                                        (ele.QID === 14 && ele.ID === 2) ||
                                                                                        ((ele.QID === 17||ele.QID === 77) && ele.ID === 1)
                                                                                    )
                                                                                })
                                                                                if (result162.length === 4) {
                                                                                    // "Onset of periods or just after with a milk case of infection also.
                                                                                    // If symptoms dont improve, then Pap Smear and Pelvic exam"
                                                                                    EndResultId = 24;
                                                                                } else {
                                                                                    // If 13. 3 = 1
                                                                                    let result20 = Answers.filter(ele => {
                                                                                        return (ele.QID === 20 && ele.ID === 1)
                                                                                    })
                                                                                    if (result20.length > 0) {
                                                                                        EndResultId = 28; // Ovulation bleeding
                                                                                    } else {
                                                                                        // If 13.4 = 1
                                                                                        let result21 = Answers.filter(ele => {
                                                                                            return (ele.QID === 21 && ele.ID === 1)
                                                                                        })
                                                                                        if (result21.length > 0) {
                                                                                            EndResultId = 30; // Mucosal injury (Lignox jelly for pain during intercourse)
                                                                                        } else {
                                                                                            // If 13.5 = 1 and 13.6 = 1
                                                                                            let result22 = Answers.filter(ele => {
                                                                                                return (ele.QID === 22 && ele.ID === 1 || ele.QID === 23 && ele.ID === 1)
                                                                                            })
                                                                                            if (result22.length === 2) {
                                                                                                EndResultId = 32; // Breakthrough bleeding
                                                                                            } else {
                                                                                                // "If 1 = 6 or 7
                                                                                                // 12 = 2
                                                                                                // 13.3 = 2 or 3 
                                                                                                // 13.4 = 2
                                                                                                // 13.5 = 2
                                                                                                // If  9 = 1"
                                                                                                let Question23Con = Answers.filter(data=>(data.QID===22&& data.ID===1) || (data.QID===23&& data.ID===2))
                                                                                                // console.log(Question23Con)
                                                                                                let result23 = Answers.filter(ele => {
                                                                                                    return (
                                                                                                        (ele.QID === 6 && (ele.ID === 6 || ele.ID === 7)) ||
                                                                                                        ((ele.QID === 17 || ele.QID === 21) && ele.ID === 2) ||
                                                                                                        (ele.QID === 20 && (ele.ID === 2 || ele.ID === 3)) ||
                                                                                                        (ele.QID === 14 && ele.ID === 1)
                                                                                                    )
                                                                                                })
                                                                                                if (result23.length === 5 && Question23Con.length===2) {
                                                                                                    EndResultId = 34; // STI test + Pelvic exam and pap smear
                                                                                                } else {
                                                                                                    // "If 1 = 6 or 7
                                                                                                    // 13.3 = 2 or 3 
                                                                                                    // 12 = 2
                                                                                                    // 13.4 = 2
                                                                                                    // 13.5 = 2
                                                                                                    // If  9 = 2"
                                                                                                    let result123 = Answers.filter(ele => {
                                                                                                        return (
                                                                                                            (ele.QID === 6 && (ele.ID === 6 || ele.ID === 7)) ||
                                                                                                            (ele.QID === 20 && (ele.ID === 2 || ele.ID === 3)) ||
                                                                                                            ((ele.QID === 17 || ele.QID === 21 || ele.QID === 14) && ele.ID === 2)
                                                                                                        )
                                                                                                    })
                                                                                                    if(result123.length === 5 && Question23Con.length === 2){
                                                                                                        EndResultId = 35; // Pelvic Exam and pap smear
                                                                                                    }else{
                                                                                                        console.log("Not matching any specified conditions!")
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        // }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            // console.log("EndResultId")
            // console.log(EndResultId)
            await knex.raw("insert into pres_data(user_id,end_result_id,doctor_status,question_ans,medical_history,topic_id) values(?,?,'Pending',?,?,?)", [UserID, EndResultId, questionsDataString, MedHistoryDataString, TopicID]);
            if(EndResultId === -1){
                //generate ticket pranav
                return ({ status: 200, message: "success",EndResultId:EndResultId, EndMessage: "Sorry! Given your responses, our doctors are unable to provide you a prescription. If you think you have made a mistake in describing your symptoms to us, please re-start your consult. If you think we have made a mistake, please reach-out on contact@askpinkypromise.com and we will address your issue ASAP."});
            }else{
                //generate ticket pranav
                let getResponse = await knex.raw("select * from pres_results where topic_id=5 and id=?",[EndResultId])
                getResponse = getResponse[0];
                // console.log(getResponse)
                if(getResponse.length>0){
                    getResponse = getResponse[0];
                    if(getResponse.next_ref !== -1){
                        let MessageResp = await knex.raw("select * from pres_results where topic_id=5 and id=?",[getResponse.next_ref])
                        return ({ status: 200, message: "success",EndResultId:EndResultId, EndMessage: MessageResp[0][0].message});
                    }else{
                        return ({ status: 200, message: "success",EndResultId:EndResultId});
                    }
                }else{
                    return ({ status: 200, message: "success",EndResultId:EndResultId });
                }
            }
        } else if (TopicID === 1) {
            let EndResultId = 0;
            let Check1to9Question = Answers.filter(data=>data.QID===51);
            if(Check1to9Question.length === 0){
                const calcAge = (dob) => {
                    var years = moment().tz("Asia/Colombo").diff(moment(dob,"DD/MM/YYYY").tz("Asia/Colombo"), 'years');
                    return years;
                };
                let getUserInfo = {
                    collection:"userdetails",
                    query:{_id: new mongo.ObjectID(UserID)},
                    Project:true,
                    ProjectData:{dob:1,weight:1,height:1},
                    Limit:true,
                    LimitValue:1,
                    Sort:true
                }
                let UserInfo = await MongoConnect.GetAccess(getUserInfo);
                UserInfo = UserInfo[0];
                console.log(UserInfo);
                let age = await calcAge(UserInfo.dob);
                console.log("User Age: "+age)
                let Question3 = Answers.filter(data=>data.QID===31&&data.ID===1);
                // If yes to 1,6,7,10,11,12,15,16,17,18,21, and 3 + age greater than or equal to 35
                let data = Answers.filter((data) => { // 11
                    return (
                        (data.QID === 29 || data.QID === 34 || data.QID === 35 || data.QID === 38 || data.QID === 39
                            || data.QID === 40 || data.QID === 43 || data.QID === 44 || data.QID === 45 || data.QID === 46 || data.QID === 48) && data.ID === 1
                    )
                })
                // If yes to 4,9,13 
                let result2 = Answers.filter(data=>{ //3
                    return(
                        (data.QID===32||data.QID===37||data.QID===41) && data.ID===1
                    )
                })
                // If yes to 2,3 (+ age less than 35),5,8,14,19,20
                let result3 = Answers.filter(data=>{ //6
                    return(
                        (data.QID===30||data.QID===31||data.QID===33||data.QID===36||data.QID===42||data.QID===49) && data.ID===1
                    )
                })
                const weight = UserInfo.weight;
                let wt, ht;
                if (weight.unit !== "Kg") {
                    wt = weight.measure / 2.205;
                } else wt = weight.measure;
                const height = UserInfo.height;
                ht = height.measure / 39.37;
                let bmiScore = wt / (ht * ht);
                console.log("bmiScore: "+bmiScore)
                let bmi = bmiScore>=35?true:false;
                if (data.length > 0 || (Question3.length===1 && age >= 35)) {
                    EndResultId = 39 // Only users
                    let Response = await knex.raw("select * from pres_results where id=? and topic_id=?", [EndResultId, TopicID]);
                    Response = Response[0][0];    
                    return ({ respCode: 200, Message: Response.message, NextRef:-1, refType:"result", })
                }else if(result2.length > 0){
                    EndResultId = 40 // Only users
                    let Response = await knex.raw("select * from pres_results where id=? and topic_id=?", [EndResultId, TopicID]);
                    Response = Response[0][0];    
                    return ({ respCode: 200, Message: Response.message, NextRef:-1, refType:"result"})
                }else if(result3.length > 0 || (Question3.length===1 && age < 35) || bmi){
                    EndResultId = 41
                    await knex.raw("insert into pres_data(user_id,end_result_id,doctor_status,question_ans,medical_history,topic_id) values(?,?,'Pending',?,?,?)", [UserID, EndResultId, questionsDataString, MedHistoryDataString, TopicID]);
                    return ({ respCode: 200, Message: "Success"})
                }else{
                    return({respCode:200, NextRef:51, refType:"Questions"})
                }
            }else{
                // 1-51,2-52,3-53,4-54,5-55,6-56,7-57,8-58,9-59
                //6 If 1 only 
                //7 If 1,2,3,4,5, (any or all)
                //8 If 1,2,3,4,5, (any or all) + 8 (8 is required) 
                //9 If 3 only 
                //10 If 6 (with or without 1,2,3,4,5,7,8,9)
                //11 If 7 only 
                //12 If 7+8 or 8 only 
                //13 If 9
                //14 If 7 + any one of or all of 1,2,3,4,5
                //15 If 7 + any one of or all of 1,2,3,4,5,8
                let Question6 = Answers.find(data=>data.QID===56)
                let Question8 = Answers.find(data=>data.QID===58)
                let First = Answers.filter(data => (data.QID === 51 && data.ID === 1) || data.ID === 2)
                if (First.length === 1) { EndResultId = 56; }
                let second = Answers.filter(data => (data.QID === 51 || data.QID === 52 || data.QID === 53 || data.QID === 54 || data.QID === 55) && data.ID === 1)
                let Ques1Alone = Answers.filter(data=>data.QID==51&&data.ID==1);
                let Ques3Alone = Answers.filter(data=>data.QID==53&&data.ID==1);
                if (second.length > 0 && (Ques1Alone.length===1 && second.length > 1) || (Ques3Alone.length===1 && second.length > 1)) { 
                    EndResultId = 57; 
                }
                let Three = Answers.filter(data => data.QID === 58 && data.ID === 1)
                if (second.length > 0 && Three.length === 1) { EndResultId = 58; }
                let Four = Answers.filter(data => (data.QID === 53 && data.ID === 1));
                let Quest9 = Answers.filter(data=> (data.QID>=51 && data.QID<=59) && data.ID===2);
                if (Four.length === 1 && Quest9.length === 8) { EndResultId = 59; }
                let Five = Answers.filter(data =>data.QID === 56 && data.ID === 1)
                if (Five.length === 1) { EndResultId = 60; }
                let Six = Answers.filter(data => data.QID === 57 && data.ID === 1)
                if (Six.length === 1) { EndResultId = 61; }
                let Seveen = Answers.filter(data => (data.QID === 58 && data.ID === 1)||((data.QID === 57||data.QID === 58)  && data.ID === 1))
                if (Seveen.length === 2) { EndResultId = 62; }
                let Eight = Answers.filter(data => data.QID === 59 && data.ID === 1)
                if (Eight.length === 1) { EndResultId = 63; }
                let Nine = Answers.filter(data => (data.QID === 51||data.QID === 52||data.QID === 53||data.QID === 54||data.QID === 55) && data.ID === 1)
                if (Nine.length >= 1 && Six.length === 1 && Question6.ID !== 1) { EndResultId = 64; }
                let Ten = Answers.filter(data => (data.QID === 51||data.QID === 52||data.QID === 53||data.QID === 54||data.QID === 55||data.QID === 58) && data.ID === 1)
                if (Ten.length >= 1 && Six.length === 1 && Question6.ID !== 1 && Question8.ID !== 1) { EndResultId = 65; }
                await knex.raw("insert into pres_data(user_id,end_result_id,doctor_status,question_ans,medical_history,topic_id) values(?,?,'Pending',?,?,?)", [UserID, EndResultId, questionsDataString, MedHistoryDataString, TopicID]);
                return ({ respCode: 200, Message: "Success",EndResultId:EndResultId})
            }
        } else if (TopicID === 4) {
            // Checking No Prescription Part
            let EndResultId = -1;
            let isPregnent = false;
            let NoPrescriptionCheck =  Answers.filter(data=>{
                return(
                    ((data.QID===71||data.QID===72||data.QID===73||data.QID===74) && data.ID===1) ||
                    (data.QID===79 && data.ID===2)
                )
            })
            if(NoPrescriptionCheck.length > 0){
                EndResultId = 44; // No Prescription
            }
            let UTIdiagnosis = false, PossibleUTI = false, RecurrentUTI = false, NoUTI = false, InPersonConsult = false;
            let lmpDate = Answers.filter(data=>data.QID===75)
            let ProceedNext = true;
            if(lmpDate.length===1){
                var given = moment(lmpDate[0].date, "YYYY-MM-DD");
                var current = moment().startOf('day');
                //Difference in number of days
                let days = moment.duration(current.diff(given)).asDays();
                console.log("days "+days)
                if(days <= 84){ // 12*7=84
                    EndResultId = 42;
                    ProceedNext = true;
                }else{
                    // C30 needs to re-check with divya
                    // isPregnent = true;
                    ProceedNext = true;
                }
            }
            if(ProceedNext){
                // let Question79 = Answers.find(data=>data.QID===79&&data.ID===2);
                let NoPrescription = Answers.filter(data=>{
                    return(
                        ((data.QID===71||data.QID===72||data.QID===73||data.QID===74)&&(data.ID===1)) ||
                        (data.QID===79&&data.ID===2)
                    )
                })
                if(NoPrescription.length > 0){
                    EndResultId = 44;
                }else{
                console.log("EndResultId: "+EndResultId);
                // UTI1-62,UTI2-63,UTI3-64,UTI3.1-65,UTI3.2-66,UTI4-67,UTI5-68, C1-69,C2-70
                let UTI1 = Answers.filter(data => data.QID === 62)
                let UTI_None = Answers.filter(data => data.QID===62 && data.ID==="5"); //UTI1 = 5
                let UTI45 = Answers.filter(data => (data.QID === 67 || data.QID === 68) && data.ID === 2) //UTI 4,5=2
                let UTI2 = Answers.filter(data => data.QID === 63 && (data.ID === "1" || data.ID === "2" || data.ID === "3")) //UTI2 = 1 or 2 or 3 alone (not in combination);
                let UTI21 = Answers.filter(data => data.QID === 63 && (data.ID==="1,2,3"||data.ID==="3,2,1"||data.ID==="1,3,2"||data.ID==="2,3,1"||data.ID==="2,1,3"||data.ID==="3,1,2")) //UTI 2=1,2 and 3;
                // If UTI1 = 1,2,3,4 (or any combination); UTI 4,5=2
                // or
                // UTI1 = 5 and UTI 2=1,2 and 3; UTI 4,5=2
                console.log(((!(UTI1[0].ID.toString()).includes("5")) && UTI45.length===2))
                console.log(UTI21)
                if ( ((!(UTI1[0].ID.toString()).includes("5")) && UTI45.length===2) || (UTI_None.length===1 && UTI45.length===2 && UTI21.length===1)) {
                    UTIdiagnosis = true;
                    EndResultId = 47; // UTI
                }
                // If UTI1 = 5 and UTI2 = 1 or 2 or 3 alone (not in combination); UTI 4,5=2
                // or
                // UTI1 = 5 and UTI2 = 1&2, 1&3 or 2&3; UTI 4,5=2
                let UTI22 = Answers.filter(data => data.QID === 63 && (data.ID === "1,2" || data.ID === "1,3" || data.ID === "2,3" || data.ID === "2,1" || data.ID === "3,1" || data.ID === "3,2"))
                if ((UTI_None.length===1 && UTI45.length === 2 && UTI2.length === 1) || (UTI_None.length===1 && UTI45.length === 2 && UTI22.length === 1)) {
                    PossibleUTI = true;
                    EndResultId = 48; // Possible UTI
                }
                let UTI3_1 = Answers.find(data=>data.QID===65);
                UTI3_1 = UTI3_1===undefined?{}:UTI3_1;
                let UTI3_2 = Answers.find(data=>data.QID===66);
                UTI3_2 = UTI3_2===undefined?{}:UTI3_2;
                let isRecurrentUTI = false;
                if((UTI3_1.ID === 2 && UTI3_2.ID === 1) || (UTI3_1.ID === 1 && UTI3_2.ID === 1) || (UTI3_1.ID === 2 && UTI3_2.ID === 2)){
                    isRecurrentUTI = true
                }
                console.log(isRecurrentUTI)
                // let UTI312 = Answers.filter(data => (data.QID === 65 && data.ID===2) || (data.QID === 66 && data.ID === 1)) // UTI3.1 or UTI3.2 = yes;
                // UTI3.1 or UTI3.2 = yes; UTI 4,5=2 not this
                // UTI3.1 = 2, and/or UTI3.2 = yes; UTI 4,5=2
                if (UTI45.length === 2 && isRecurrentUTI) {
                    RecurrentUTI = true;
                    EndResultId = 50; // Recurrent UTI
                }
                // UTI1 =5 and UTI2 = 4; UTI 4,5 = 2
                let UTI23 = Answers.filter(data => data.QID === 63 && data.ID === "4") //UTI2 = 4;
                if (UTI_None.length===1 && UTI23.length === 1 && UTI45.length === 2) {
                    NoUTI = true;
                    EndResultId = 51; // No UTI
                }
                if(UTIdiagnosis===false&&PossibleUTI===false&&RecurrentUTI===false&&NoUTI===false){
                    // If UTI 4,5 (any one) = 1	Escalate for in-person consult,InPersonConsult
                    let UTI451 = Answers.filter(data => (data.QID === 67 || data.QID === 68) && data.ID === 1) //UTI 4,5 (any one) = 1
                    if (UTI451.length > 0) {
                        InPersonConsult = true;
                        EndResultId = 52; //Escalate for in-person consult
                    }
                }
            }

            console.log(EndResultId)
            // 47	UTI
            // 48	Possible UTI
            // 50	Recurrent UTI
            // 51	No UTI
            // 52	Escalate for in-person consult
            let response = {}
            await knex.raw("insert into pres_data(user_id,end_result_id,doctor_status,question_ans,medical_history,topic_id,is_pregnant) values(?,?,'Pending',?,?,?,?)", [UserID, EndResultId, questionsDataString, MedHistoryDataString, TopicID, isPregnent]);
            if (UTIdiagnosis || PossibleUTI || RecurrentUTI || NoUTI || InPersonConsult) {
                if (UTIdiagnosis || PossibleUTI || RecurrentUTI) {
                    response = { 
                        respCode: 200, Message:"success", UserMessage:"Thanks a lot for giving me all your answers! I will be back in a few minutes with your prescription and we can then discuss any further questions you may have"
                    };
                }else if (NoUTI) {
                    response = { 
                        respCode: 200, Message:"success", UserMessage:"Sorry! Based on your symptoms, it does not seem like you have a UTI. None of \
                    the typical symptoms of UTI like burning sensation while peeing, frequent urge to \
                    urinate, passing small amounts of urine, pain in abdominal area, strong smelling urine, \
                    etc were shown by you. If you think we may be incorrect, please leave your \
                    phone number below so our care team can contact you!"}
                }else if (InPersonConsult) {
                    response = { 
                        respCode: 200, Message: "success", UserMessage:"You have reported that you have fever with chills and/or you often see blood in your urine. Please see a doctor in person as you may have symptoms that require immideate attention"
                    }
                }
            } else {
                let result = await knex.raw("select message from pres_results where id=?",[EndResultId])
                response = { 
                    respCode: 200, Message: "success"
                }
                if(result.length>0){
                    response.UserMessage=result[0][0].message
                }
            }
            response.EndResultId = EndResultId;
            return(response);
            }
        }
    } catch (error) {
        console.log(error)
        return ({ status: 400, message: error.message });
    }
}
exports.processInput = StorePrescriptionData;