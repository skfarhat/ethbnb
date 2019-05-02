const mongoose = require('mongoose')
const Accounts = require('./models/Account')
const Listings = require('./models/Listing')
const Bookings = require('./models/Booking')
const IPFSImage = require('./models/IPFSImage')

module.exports = class Database {

  constructor(options) {
    this.options = options
    this.connectOpts = {
      newUrlParser: true,
      autoReconnect: true,
    }
    this.connect_str = format("mongodb://{host}:{port}/{db_name}", options)
  }

  async connectSync() {
    return new Promise(resolve => {
      mongoose.connection.on('error', (e) => {
        logger.error('Failed to connect to mongoose', e)
        resolve(false)
      })
      mongoose.connection.on('open', () => {
        logger.info('Connected to database')
        resolve(true)
      })
      mongoose.connect(this.connect_str, this.connectOpts);
    })
  }

  connect() {
    mongoose.connection.on('error', (e) => {
      logger.error('Failed to connect to mongoose', e)
    })
    mongoose.connection.on('open', () => {
      logger.info('Connected to database')
    })
    mongoose.connect(this.connect_str, this.connectOpts);
  }

  // Delete all documents
  async clear() {
    // Database clear
    logger.info('Clearing database')
    await Accounts.deleteMany({})
    await Listings.deleteMany({})
    await IPFSImage.deleteMany({})
    await Bookings.deleteMany({})
    logger.info('Finished clearing database')
  }
}
