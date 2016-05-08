var express = require('express');
var watson  = require('watson-developer-cloud');
var Tone    = require('../models/tone');

// TODO: move out credentials
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
        console.error(err);
        return callback(err);
      }
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
          return callback(err);
        }
        console.log('saved tone to db');
      });
      return callback(null, ret);
    });

};

module.exports = toneAnalyzerService;
