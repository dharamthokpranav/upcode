const mysql = require('mysql');
const mongoose = require('mongoose');
const MongoClient = require('mongodb').MongoClient;



var profile = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  multipleStatements: true
}

exports.closeConnection = function (conn) {
  // console.log("Closing Connection...");
  conn.end();
}

exports.openConnection = function () {
  // console.log("..Opening Connection...");
  var connection = mysql.createConnection(profile);
  connection.on('error', function (err) {
    console.log('db error.. Handling it!!', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      //handleDisconnect();                         // lost due to either server restart, or a
      connection = mysql.createConnection(profile);
    } else {                                      // connnection idle timeout (the wait_timeout
      connection = mysql.createConnection(profile);                            // server variable configures this)
    }
  });
  return connection;
}

exports.openMongoDBConnection = function () {
  const URL = process.env.MONGODBURL;
  const Mongo = new MongoClient(URL, { useNewUrlParser: true, useUnifiedTopology: true });
  Mongo.connect().catch(function (error) { console.log("Failed to connect to MongoDB server") });
  return Mongo;
}
