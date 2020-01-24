const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountSchema = new Schema({
  addr: { type: String, index: true },
  name: String,
  dateCreated: { type: Date, set: setMongoDate },
  // Counts the total score received for this account
  // Note: this is not the average
  totalScore: Number,
  // Counts the number of ratings received for this account
  nRatings: Number,
})

const Account = mongoose.model('accounts', AccountSchema)
module.exports = Account
