const URL = process.env.MONGODBURL;
const MongoClient = require('mongodb').MongoClient;
const Mongo = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true });
Mongo.connect().then(()=>{
    console.log("Successfully connected to MongoDB")
}).catch(function(error){
    console.log(error)
    console.log("Failed to connect to MongoDB")
});
const DataBase = process.env.DBNAME;

// async function MongoConnect(req){
//     return MongoConnection.connect().then(()=>{
//         console.log("Successfully connected to MongoDB")
//         return({message:"success"})
//     }).catch(function(error){
//         console.log(error)
//         console.log("Failed to connect to MongoDB")
//         return({message:"failed"})
//     });
// }exports.MongoConnect=MongoConnect;

async function GetAccess(req){
    try{
        if(req.Sort === false){
            if(req.Project === true && req.Limit === true){
                let response = await Mongo.db(DataBase).collection(req.collection).find(req.query).project(req.ProjectData).limit(req.LimitValue).toArray();
                return(response);    
            }else if(req.Project === true && req.Limit === false){
                let response = await Mongo.db(DataBase).collection(req.collection).find(req.query).project(req.ProjectData).toArray();
                return(response);    
            }else if(req.Project === false && req.Limit === true){
                let response = await Mongo.db(DataBase).collection(req.collection).find(req.query).limit(req.LimitValue).toArray();
                return(response);    
            }else if(req.Project === false && req.Limit === false){
                let response = await Mongo.db(DataBase).collection(req.collection).find(req.query).toArray();
                return(response);    
            }else{
                // Not Decided Yet
            }
        }else{
            if(req.Project === true && req.Limit === true){
                let response = await Mongo.db(DataBase).collection(req.collection).find(req.query).project(req.ProjectData).sort(req.SortQuery).limit(req.LimitValue).toArray();
                return(response);    
            }else if(req.Project === true && req.Limit === false){
                let response = await Mongo.db(DataBase).collection(req.collection).find(req.query).project(req.ProjectData).sort(req.SortQuery).toArray();
                return(response);    
            }else if(req.Project === false && req.Limit === true){
                let response = await Mongo.db(DataBase).collection(req.collection).find(req.query).sort(req.SortQuery).limit(req.LimitValue).toArray();
                return(response);    
            }else if(req.Project === false && req.Limit === false){
                let response = await Mongo.db(DataBase).collection(req.collection).find(req.query).sort(req.SortQuery).toArray();
                return(response);    
            }else{
                // Not Decided Yet
            }
        }
    }catch(error){
        console.log(error);
        return({respCode: 400, respText: "error", message: error.message});
    }
}
exports.GetAccess=GetAccess;
