const mongoose = require('mongoose')
const Accounts = require('./models/Account')
const Listings = require('./models/Listing')
const Bookings = require('./models/Booking')
const IPFSImage = require('./models/IPFSImage')

const Database = (options) => {
  const connectStr = format('mongodb://{host}:{port}/{db_name}', options)
  const connectOpts = {
    newUrlParser: true,
    autoReconnect: true,
  }

  return {
    connectSync: async () => new Promise((resolve) => {
      mongoose.connection.on('error', (e) => {
        logger.error('Failed to connect to mongoose', e)
        resolve(false)
      })
      mongoose.connection.on('open', () => {
        logger.info('Connected to database')
        resolve(true)
      })
      mongoose.connect(connectStr, connectOpts)
    }),

    connect: () => {
      mongoose.connection.on('error', (e) => {
        logger.error('Failed to connect to mongoose', e)
      })
      mongoose.connection.on('open', () => {
        logger.info('Connected to database')
      })
      mongoose.connect(connectStr, connectOpts)
    },

    // Delete all documents
    clear: async () => {
      // Database clear
      logger.info('Clearing database')
      await Accounts.deleteMany({})
      await Listings.deleteMany({})
      await IPFSImage.deleteMany({})
      await Bookings.deleteMany({})
      logger.info('Finished clearing database')
    },
  }
}

module.exports = Database
