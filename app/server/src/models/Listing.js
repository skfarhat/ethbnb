const mongoose = require('mongoose')

const Schema = mongoose.Schema

const Listing = mongoose.model('listings', new Schema({
  owner: String,
  lid: { type: Number, index: true },
  title: String,
  description: String,
  price: Number,
  country: Number,
  location: String,
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'bookings' }],
  images: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ipfs_images' }],
  // Counts the total score received for this account
  // Note: this is not the average
  totalScore: Number,
  // Counts the number of ratings received for this account
  nRatings: Number,
}))

module.exports = Listing
