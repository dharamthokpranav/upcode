let email_Subject= "Prescription for your consultation with Dr [PLACEHOLDER_SUBJECT]";
let email_body = '<html><body><p>Dear [PLACEHOLDER_NAME],</p>'+
''+
'<p>Dr. [PLACEHOLDER_DOCTORNAME] has prepared a prescription for you following your consultation. Please find it attached here. Take care!</p>'+
''+
'<p>Regards,</p> <p> Team Pinky Promise</p> <p>[PLACEHOLDER_PHONE]</p><body><html>';

module.exports = {
    email_Subject,
    email_body
}