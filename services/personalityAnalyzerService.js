var _      = require('lodash');
var extend = _.extend;
var watson = require('watson-developer-cloud');

// TODO: move out credentials
var WATSON_USER_PERSONALITY  = process.env.WATSON_USER_PERSONALITY;
var WATSON_PASS_PERSONALITY  = process.env.WATSON_PASS_PERSONALITY;

var personalityInsights = watson.personality_insights({
  username: WATSON_USER_PERSONALITY,
  password: WATSON_PASS_PERSONALITY,
  "version": "v2",
  "headers": {
    "X-Watson-Learning-Opt-Out": 1
  }
})

function getPersonalityProfile(io, data, callback) {
  personalityInsights.profile({
    text: sanitize(data),
    language: 'en'
  }, callback);
}

function sanitize(data) {
  return extend(data, {
    text: data.text ? data.text.replace(/[\s]+/g, ' ') : undefined
  });
};

module.exports.getPersonalityProfile = getPersonalityProfile;
