const nodemailer = require("nodemailer");
var pdf = require("pdf-creator-node");
var fs = require("fs");
var FCM = require('fcm-node');

class commonOprations {

  constructor(){}

async  sendEmail(subject,body,data) {
    let user = process.env.NODEMAILER_USER
    let pass = process.env.NODEMAILER_PASSWORD;
    let from = 'samuser@3010@gmail.com';
    let htmlContent = body;
    let subjectContent = subject;
    
    var transporter = nodemailer.createTransport('smtps://'+user+':'+pass+'@smtp.gmail.com');
  
    let info = await transporter.sendMail({
      from: from,
      to: data.recipientEmail,
      subject: subjectContent,
      html: htmlContent,
      attachments: [{
        filename: 'Prescription.pdf',
        path: data.pdfPath,
        contentType: 'application/pdf'
      }],
    });
  
    return  info;
  }

  async   sendPushNotification(userInfo)
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
                  // additionalData : {'message_id':messageId,'room_id':ChatRoomId}
              },
              data: {
                  title: NotificationTitle,
                  body: NotificationBody,
                  // additionalData : {'message_id':messageId,'room_id':ChatRoomId}
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
}

module.exports = commonOprations;
