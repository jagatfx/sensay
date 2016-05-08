var express = require('express');
var router  = express.Router();
var Tone    = require('../models/tone');
var toneAnalyzerService = require('../services/toneAnalyzerService');
/*
var watson  = require('watson-developer-cloud');
var WATSON_URL   = process.env.WATSON_URL;
var WATSON_USER  = process.env.WATSON_USER;
var WATSON_PASS  = process.env.WATSON_PASS;




var toneAnalyzer = watson.tone_analyzer({
  url: WATSON_URL,
  username: WATSON_USER,
  password: WATSON_PASS,
  version_date: '2016-11-02',
  version: 'v3-beta'
});
*/
var theRouter = function(io) {


  router.get('/test', function(req, res, next) {
    return res.json({result: "OK"});
  });

  router.get('/tone', function(req, res, next) {
    var tonesToRet = 10;
    Tone.find({})
    .sort({createdAt: -1})
    .limit(tonesToRet)
    .exec(function(err, tones) {
      if (err) {
        console.error(err);
        return res.json( {result: 'Error: getting tones'} );
      }
      return res.json(tones);
    });
  });

  router.post('/tone', function(req, res, next) {
    toneAnalyzerService(io, req.body.text, function(err, data){
      if(err) {
        console.error(err);

        return next(err);
      }
      else {
        res.json(data);
      }
    });

/*
    toneAnalyzer.tone(req.body, function(err, data) {
      if (err) {
        return next(err);
      }
      else {
        var ret = {
          text: req.body.text,
          result: data
        };
        if (io.sockets) {
          io.sockets.emit('tone', ret);
        } else {
          console.error('could not emit tone');
        }
        new Tone({
          text: req.body.text,
          result: data
        }).save( function( err, tone, count ) {
          if (err) {
            console.error(err);
            return res.json( {result: err} );
          } else {
            console.log('saved tone to db');
          }
        });
        return res.json(ret);
      }
    });
*/
  });

  return router;
};

module.exports = theRouter;
