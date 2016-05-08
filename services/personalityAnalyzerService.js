var _      = require('lodash');
var extend = _.extend;
var watson = require('watson-developer-cloud');

// TODO: move out credentials
var WATSON_URL   = process.env.WATSON_URL;
var WATSON_USER  = process.env.WATSON_USER;
var WATSON_PASS  = process.env.WATSON_PASS;

var personalityInsights = watson.personality_insights({
  url: WATSON_URL,
  username: WATSON_USER,
  password: WATSON_PASS,
  version_date: '2016-11-02',
  version: 'v3-beta'
})

function getPersonalityProfile(paramters, callback) {
  personalityInsights.profile(sanitize(parameters), callback);
}

function sanitize(parameters) {
  return extend(parameters, {
    text: parameters.text ? parameters.text.replace(/[\s]+/g, ' ') : undefined
  });
};

module.exports.getPersonalityProfile = getPersonalityProfile;
