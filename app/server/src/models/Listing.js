var mongoose = require('mongoose')
var Schema   = mongoose.Schema
var ObjectId = Schema.ObjectId

var Listing = mongoose.model('listings', new Schema({
  _id: Number, 
  lid: String,
  title : String,
  owner_id: Number,
  description: String,
  price: Number, 
  country: Number, 
  location: String,
}))

module.exports = Listing
