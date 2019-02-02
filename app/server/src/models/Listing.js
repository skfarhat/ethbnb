var mongoose = require('mongoose')
var Schema   = mongoose.Schema
var ObjectId = Schema.ObjectId

var Listing = mongoose.model('listings', new Schema({
  id: Number,
  title : String,
  owner_id: Number,
  description: String,
}))

module.exports = Listing
