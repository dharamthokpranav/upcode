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



//Files import
const doctorsroutes = require('./routes/routes');
const StatusUpdater = require('./modules/StatusUpdater');



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
app.use('/api/doctor-dashboard',doctorsroutes);


app.get('/', function (req, res) {
  res.status(200).send('Hello World!');
});

//Schedulers


schedule.scheduleJob('*/30 * * * * *', function() { //note : midnight UTC(18:31) is equal to IST(00:01 Or 12:01 am)
  console.log("10 sec Interval scheduler triggered @ IST: "+moment().tz("Asia/Colombo").format()+" and UTC: "+(new Date()))
  //  StatusUpdater.statusUpdater();  
});

var port = process.env.PORT || 3000;
var server = app.listen(port, function() {
  console.log('App is running on port: ' + port);
});