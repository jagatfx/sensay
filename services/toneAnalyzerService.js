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

var toneAnalyzerService = function(io, text, callback) {

      toneAnalyzer.tone({ text: text}, function(err, data) {

        if (err) {
          console.error(err);
          return callback(err);
        }
        var ret = {
          text: text,
          result: data
        };
        if (io.sockets) {
          io.sockets.emit('tone', ret);
        } else {
          console.error('could not emit tone');
        }
        new Tone({
          text: text,
          result: data
        }).save( function( err, tone, count ) {
          if (err) {
            console.error(err);
            return callback(err);
          } else {
            console.log('saved tone to db');
          }
        });
        return callback(null, ret);
    });

};

module.exports = toneAnalyzerService;
