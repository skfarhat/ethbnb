var mongoose = require('mongoose')
var Schema   = mongoose.Schema
var ObjectId = Schema.ObjectId



const BookingSchema = new Schema({
    user: String,
    bid: Number,
    lid: Number,
    from_date: { type: Date, set: setMongoDate },
    to_date: { type: Date, set: setMongoDate }
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
