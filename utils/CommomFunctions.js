const nodemailer = require("nodemailer");
// async..await is not allowed in global scope, must use a wrapper
async function sendEmail(subject,text,email) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let user = process.env.NODEMAILER_USER
    let pass = NODEMAILER_PASSWORD;
    var transporter = nodemailer.createTransport('smtps://'+user+':'+pass+'@smtp.gmail.com');
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <samuser@3010@gmail.com>', // sender address
      to: "dharamthokpranav@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
  
    return  info;
  }
  module.exports=sendEmail;