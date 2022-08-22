var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const cors = require('cors');
const path = require('path');
const moment = require('moment-timezone');
const dotenv = require('dotenv');
var schedule = require('node-schedule');
dotenv.config();

//End of dependencies


//Routes
const doctorsroutes = require('./routes/routes');
const pathRoutes = require('./routes/path_routes');


//Files import
const StatusUpdater = require('./modules/StatusUpdater');
const Prescription_API_Routing = require("./prescriptionModule/Prescription/Routing/Routing");



//Body-parser
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));

//Body-parser
app.use(bodyParser.json({
  limit: '50mb'
}));


//express CORS
app.use(cors());


app.use(express.static(path.join(__dirname, 'Files/Images'))); //image icons access from server


//express CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,access_token');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});


//express router
app.use('/api/doctor-dashboard', doctorsroutes);
app.use('/api/pathology-test', pathRoutes);

//TEST API
app.get('/', function (req, res) {
  res.status(200).send('Hello World!');
});



//Prabhu's code start
app.get('/pres/*',processRequest);
app.post('/pres/*',processRequest);

app.get('/TESTING',TESTING);

async function processRequest(req,res){
    try {
        await Prescription_API_Routing.Routing(req,res);
    } catch (error) {
        res.send({status:400, message: error.message});
    }
}

async function TESTING(req,res){
    try{
        res.send({status:200, ISTcurrentTimeStamp:moment().tz("Asia/Colombo").format(),Time:moment().tz("Asia/Colombo").format('h:mm a'),UTC: new Date()});   
    }catch(error){
        res.send({status:400, message: error.message});   
    }
}
//Prabhu's code end


//Schedulers
schedule.scheduleJob('*/30 * * * * *', function() { //note : midnight UTC(18:31) is equal to IST(00:01 Or 12:01 am)
  console.log("30 sec Interval scheduler triggered @ IST: "+moment().tz("Asia/Colombo").format()+" and UTC: "+(new Date()))
   //StatusUpdater.statusUpdater();  
});

var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
  console.log('App is running on port: ' + port);
});