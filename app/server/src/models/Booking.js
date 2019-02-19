var mongoose = require('mongoose')
var Schema   = mongoose.Schema
var ObjectId = Schema.ObjectId

const BookingSchema = new Schema({
    bid: String,
    lid: Number,
    from_date: Date,
    to_date: Date,
  },
  {
    toObject: {virtuals: true},
  }
)

// Foreign keys definitions
BookingSchema.virtual('listing', {
  ref: 'listings',
  localField: 'lid',
  foreignField: 'lid',
  justOne: true // for many-to-1 relationships
});

var Booking = mongoose.model('bookings', BookingSchema)
module.exports = Booking
