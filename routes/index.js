var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { });
});

/* GET consumer page for testing consumer support ticket messages */
router.get('/consumer', function(req, res, next) {
  res.render('consumer', { });
});

module.exports = router;
