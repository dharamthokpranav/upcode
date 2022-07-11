var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({ extended: false })) 

// parse application/json
app.use(bodyParser.json()) 


app.get('/', function (req, res) {
  res.status(200).send('Hello World!');
});

app.post('/loginUser', function (req, res) {
    var username= req.body.userName;
    var password= req.body.password;
    console.log(username)
  });

var port = process.env.PORT || 3000;

var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});