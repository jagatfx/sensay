
var TWILIO_ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID;
var TWILIO_AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN;
var TWILIO_NUMBER       = process.env.TWILIO_NUMBER;

var client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

function sendSms(to, message) {
  client.messages.create({
    body: message,
    to: to,
    from: TWILIO_NUMBER
//  mediaUrl: imageUrl
  }, function(err, data) {
    if (err) {
      console.error(err);
    } else {
      console.log('twilio sms sent');
    }
  });
};

module.exports.sendSms = sendSms;
