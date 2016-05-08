
TWILIO_ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID;
TWILIO_AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN;
TWILIO_NUMBER       = process.env.TWILIO_NUMBER;
TWILIO_ADMIN_NUMBER = process.env.TWILIO_ADMIN_NUMBER;

var client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

function sendSms(to, message) {
  // for now only send to twilio admin number
  to = TWILIO_ADMIN_NUMBER;

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
