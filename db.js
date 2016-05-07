var mongoose = require('mongoose');
mongoose.set('debug', true);
var Tone = require('./models/tone');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

mongoose.connect(process.env.MONGOLAB_URI, function (error) {
  if (error) console.error(error);
  else console.log('mongo connected');
});
