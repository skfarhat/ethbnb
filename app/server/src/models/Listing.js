var mongoose = require('mongoose')
var Schema   = mongoose.Schema
var ObjectId = Schema.ObjectId

var Listing = mongoose.model('listings', new Schema({
  _id: Number,
  owner: String,
  lid: { type: Number, index: true },
  title : String,
  description: String,
  price: Number,
  country: Number,
  location: String,
  bookings: [{type: mongoose.Schema.Types.ObjectId, ref: 'bookings'}],
  images: [{type: mongoose.Schema.Types.ObjectId, ref: 'ipfs_images'}],
}))

module.exports = Listing
