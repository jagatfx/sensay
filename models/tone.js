var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Tone = new Schema({
  text: String,
  result: Schema.Types.Mixed,
  userName: String,
  userType: String,
  channel: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Tone', Tone);
