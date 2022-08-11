const nodemailer = require("nodemailer");
var pdf = require("pdf-creator-node");
var fs = require("fs");
var FCM = require('fcm-node');

async function sendEmail(subject,text,email,recipientEmails) {
    let user = process.env.NODEMAILER_USER
    let pass = process.env.NODEMAILER_PASSWORD;
    let from = 'samuser@3010@gmail.com';
    let htmlContent = "HTML";
    let subjectContent = "Hello";
    
    var transporter = nodemailer.createTransport('smtps://'+user+':'+pass+'@smtp.gmail.com');
  
    let info = await transporter.sendMail({
      from: from, // sender address
      to: recipientEmails, // list of receivers
      subject: subjectContent, // Subject line
      html: htmlContent, // html body
    });
  
    return  info;
  }

  async function sendPushNotification()
  {
    if(Response.status === 200){
      if(Response.Data.length>0){
        NotificationTitle = "You have received a reply to your question";
        NotificationBody = "Click here to view it and respond";
        let element = Response.Data[0];
        if(userInfo.divicetoken !== undefined &  userInfo.divicetoken !== null &&  userInfo.divicetoken !== "" &&  userInfo.divicetoken.length != 0){
          //multipleDeviceTokens.push({Title:NotificationTitle,Body:NotificationBody,token:element.userInfo.divicetoken});
          var serverKey = process.env.FCMSERVERAPIKEY; //put your server key here
          var fcm = new FCM(serverKey);
          var message = {
              to:element.userInfo.divicetoken,
              collapse_key: 'your_collapse_key', // not Mandatory
              notification: {
                  title: NotificationTitle,
                  body: NotificationBody,
                  additionalData : {'message_id':messageId,'room_id':ChatRoomId}
              },
              data: {
                  title: NotificationTitle,
                  body: NotificationBody,
                  additionalData : {'message_id':messageId,'room_id':ChatRoomId}
              }
          };
          fcm.send(message, function(err, response){
              if (err) {
                  console.log("Something has gone wrong- chatroom notification!...>>>>>");
                  console.log(err);
              }
              else {
                  console.log("Successfully sent with response: ", response);
              }
          }); 
                                
          }
           
      }
  }
  }
  module.exports=sendEmail;




  // async function sendpdf(subject,text,email) {

// var pdftemp=`<!DOCTYPE html>
// <html>
//   <head>
//     <meta charset="utf-8" />
//     <title>Hello world!</title>
//   </head>
//   <body>
//     <h1>User List</h1>
//     <ul>
//      ddd
//       <li>Name: Pranv</li>
//       <li>Age: 27</li>
//       <br />
//       cc
//     </ul>
//   </body>
// </html>`;
// var options = {
//   format: "A3",
//   orientation: "portrait",
//   border: "10mm",
//   header: {
//       height: "45mm",
//       contents: '<div style="text-align: center;">Author: Shyam Hajare</div>'
//   },
//   footer: {
//       height: "28mm",
//       contents: {
//           first: 'Cover page',
//           2: 'Second page', // Any page number is working. 1-based index
//           default: '<span style="color: #444;"></span>/<span></span>', // fallback value
//           last: 'Last Page'
//       }
//   }
// };
// var document = {
//   html:pdftemp,
   
//   path: "./output.pdf",
//   type: "",
// };
//   pdf.create(document, options)
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((error) => {
//     console.error(error);
//   });
// }