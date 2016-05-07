var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var Tone = new Schema({
  text: String,
  result: Schema.Types.Mixed
}, {
  timestamps: true
});

module.exports = mongoose.model('Tone', Tone);
