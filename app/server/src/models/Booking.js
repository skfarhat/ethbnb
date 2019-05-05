const mongoose = require('mongoose')
const Schema = mongoose.Schema

const BookingSchema = new Schema({
  user: String,
  bid: Number,
  lid: Number,
  from_date: { type: Date, set: setMongoDate },
  to_date: { type: Date, set: setMongoDate },
  // Determined by the host
  guestRating: Number,
  // Determined by the guest
  ownerRating: Number,
},
{
  toObject: { virtuals: true },
})

// Foreign keys definitions
BookingSchema.virtual('listing', {
  ref: 'listings',
  localField: 'lid',
  foreignField: 'lid',
  // for many-to-1 relationships
  justOne: true,
})

const Booking = mongoose.model('bookings', BookingSchema)
module.exports = Booking
