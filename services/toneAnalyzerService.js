var express = require('express');
var watson  = require('watson-developer-cloud');
var Tone    = require('../models/tone');

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

var toneAnalyzerService = function(io, userContext, text, callback) {

      toneAnalyzer.tone({ text: text}, function(err, data) {


        if (err) {
          return callback(err);
          //return next(err);
        }
        else {
          var ret = {
            text: text,
            userName: userContext.userName,
            userType: userContext.userType,
            channel: userContext.channel,
            result: data
          };
          if (io.sockets) {
            io.sockets.emit('tone', ret);
          } else {
            console.error('could not emit tone');
          }
          new Tone({
            text: text,
            userName: userContext.userName,
            userType: userContext.userType,
            channel: userContext.channel,
            result: data
          }).save( function( err, tone, count ) {
            if (err) {
              console.error(err);
              return callback(err, null);
              //return res.json( {result: err} );
            } else {
              console.log('saved tone to db');
            }
          });
          return callback(null, ret);
          //return ret;
        }
    });

};

module.exports = toneAnalyzerService;
