var express = require('express');
var router  = express.Router();
var Tone    = require('../models/tone');
var toneAnalyzerService = require('../services/toneAnalyzerService');
var personalityAnalyzerService = require('../services/personalityAnalyzerService');

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

  return router;
};

module.exports = theRouter;
