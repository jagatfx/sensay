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

const NEUTRAL_TONE = "Neutral";

var toneAnalyzerService = function(io, userContext, text, callback) {

    toneAnalyzer.tone({ text: text}, function(err, data) {

      var sentiment = evaluateSentiment(data);
      var agreeable = evaluateAgreeable(data);

      if (err) {
        console.error(err);
        return callback(err);
      }
      var ret = {
        text: text,
        userName: userContext.userName,
        userType: userContext.userType,
        channel: userContext.channel,
        result: data,
        sentiment: sentiment,
        agreeable: agreeable
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
        result: data,
        sentiment: sentiment,
        agreeable: agreeable
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
    });

};


function evaluateSentiment(toneData) {
      //Find the emotion_tone section in the json response
    var emotionTone = toneData.document_tone.tone_categories.find(function(tone_category){ return tone_category.category_id === 'emotion_tone'; });

    //Find the max emotion tone score
    var maxScore = Math.max.apply(Math,emotionTone.tones.map(function(tone){return tone.score;}));


    var angerTone = emotionTone.tones.find(function(tone){ return tone.tone_id === 'anger'; });
    var disgustTone = emotionTone.tones.find(function(tone){ return tone.tone_id === 'disgust'; });

    //Threshold of score of .45, or BOTH anger and disgust have a slight value, otherwise we treat it as neutral
    if(maxScore < .4 && !(angerTone.score > .3 && disgustTone.score > .22)) {
      return NEUTRAL_TONE;
    }

    //Using the max score, find the tone object with that score
    var toneWithHighestScore = emotionTone.tones.find(function(tone){ return tone.score == maxScore; });

    console.log(toneWithHighestScore.tone_name);
    
    //Find out the tone name
    toneName = toneWithHighestScore.tone_name;

    return toneName;
}

function evaluateAgreeable(toneData) {

    //Find the social_tone section in the json response
    var socialTone = toneData.document_tone.tone_categories.find(function(tone_category){ return tone_category.category_id === 'social_tone'; });

    var agreeableTone = socialTone.tones.find(function(tone){ return tone.tone_id === 'agreeableness_big5'; });



    var languageTone = toneData.document_tone.tone_categories.find(function(tone_category){ return tone_category.category_id === 'language_tone'; });
    var analyticalTone = languageTone.tones.find(function(tone){ return tone.tone_id === 'analytical'; });


    if(agreeableTone.score > .8 || analyticalTone.score > .87)
      return true;

    return false;
}

module.exports = toneAnalyzerService;
