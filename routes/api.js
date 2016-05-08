var express = require('express');
var router  = express.Router();
var Tone    = require('../models/tone');
var toneAnalyzerService = require('../services/toneAnalyzerService');
var personalityAnalyzerService = require('../services/personalityAnalyzerService');
var twilioService = require('../services/twilioService');

var theRouter = function(io) {

  router.get('/test', function(req, res, next) {
    return res.json({result: "OK"});
  });

  router.post('/personality', function(req, res, next) {
    personalityAnalyzerService.getPersonalityProfile(io, req.body, function(err, data) {
      if (err) {
        console.error(err);
        return res.json({result: 'Error: posting /personality'});
      }
      return res.json(data);
    });
  });

  router.get('/tone', function(req, res, next) {
    var tonesToRet = 10;
    Tone.find({})
    .sort({createdAt: -1})
    .limit(tonesToRet)
    .exec(function(err, tones) {
      if (err) {
        console.error(err);
        return res.json( {result: 'Error: getting /tone'} );
      }
      return res.json(tones);
    });
  });

  router.post('/tone', function(req, res, next) {

    var userContext = {
        userName: 'Zaphod',
        channel: 'echo',
        userType: 'consumer'
    };

    toneAnalyzerService(io, userContext, req.body.text, function(err, data){
      if(err) {
        console.error(err);
        return res.json( {result: 'Error: posting /tone'} );
      }
      else {
        return res.json(data);
      }
    });

  });


  router.post('/toneValidate', function(req, res, next) {

    var userContext = {
        userName: 'Support',
        channel: 'web',
        userType: 'support'
    };

    var toneResult = toneAnalyzerService(io, userContext, req.body.text, function(err, data){
      if(err) {
        console.error(err);
        return res.json( {result: 'Error: posting /tone'} );
      }
      else {
        return res.json(data);
      }
    }, true);

  });

  router.get('/sms', function(req, res, next) {
    twilioService.sendSms(null, 'This is a test of the broadcast system....beeeeeep.');
    return res.json({result: 'OK'});
  });

  var TWILIO_CUSTOMER_NUMBER = process.env.TWILIO_CUSTOMER_NUMBER;
  router.post('/sms', function(req, res, next) {
    var to = TWILIO_CUSTOMER_NUMBER;
    twilioService.sendSms(to, req.body.text);
    return res.json({result: 'OK'});
  });

  router.post('/smsreply', function(req, res, next) {
    console.log('SMS reply received:'+JSON.stringify(req.body));
    var userContext = {
        userName: req.body.From ? req.body.From : 'twilio',
        channel: 'twilio',
        userType: 'consumer'
    };
    toneAnalyzerService(io, userContext, req.body.Body, function(err, data){
      if(err) {
        console.error(err);
        return res.json( {result: 'Error: sms error calling toneAnalyzerService()'} );
      }
      else {
        return res.json({result: 'OK'});
      }
    });
  });

  var TWILIO_MANAGER_NUMBER = process.env.TWILIO_MANAGER_NUMBER;
  router.post('/sms-manager', function(req, res, next) {
    var to = TWILIO_MANAGER_NUMBER;
    twilioService.sendSms(to, req.body.text);
    return res.json({result: 'OK'});
  });

  router.post('/sms-appease', function(req, res, next) {
    var to = TWILIO_CUSTOMER_NUMBER;
    twilioService.sendSms(to, req.body.text);
    return res.json({result: 'OK'});
  });

  router.get('/clear', function(req, res, next) {
    Tone.remove({}, function(err) {
      if (err) {
        console.error(err);
        return res.json( {result: 'Error: in /clear'} );
      }
      return res.json({result: 'OK'});
    });
  });

  return router;
};

module.exports = theRouter;
