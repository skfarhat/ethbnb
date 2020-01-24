const mongoose = require('mongoose')
const mongooseHidden = require('mongoose-hidden')()


const ListingSchema = new mongoose.Schema({
  owner: String,
  lid: { type: Number, index: true, unique: true },
  title: String,
  description: String,
  price: Number,
  country: Number,
  location: String,
  imageCID: String,
  imageCIDSource: String,
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'bookings' }],
  // Counts the total score received for this account
  // Note: this is not the average
  totalScore: Number,
  // Counts the number of ratings received for this account
  nRatings: Number,
  // The hash of the transaction hash responsible
  // for creating this listing. This field is not exposed.
  txHash: { type: String, unique: true, hide: true, default: null },
})

ListingSchema.plugin(mongooseHidden)

module.exports = mongoose.model('listings', ListingSchema)
