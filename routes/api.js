var express = require('express');
var router  = express.Router();
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

router.get('/test', function(req, res, next) {
  return res.json({result: "OK"});
});

router.post('/tone', function(req, res, next) {
  toneAnalyzer.tone(req.body, function(err, data) {
    if (err)
      return next(err);
    else
      return res.json(data);
  });
});

module.exports = router;
