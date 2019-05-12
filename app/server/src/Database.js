const mongoose = require('mongoose')
const Accounts = require('./models/Account')
const Listing = require('./models/Listing')
const Booking = require('./models/Booking')
const IPFSImage = require('./models/IPFSImage')

const Database = (options) => {
  const connectStr = `mongodb://${options.host}:${options.port}/${options.db_name}`
  const connectOpts = {
    useNewUrlParser: true,
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

    // Create or update a listing document.
    //
    // If we find an listing with a matching
    // transactionHash OR an lid we update it
    //
    // To be clear, there are two possible scenarios:
    //
    // 1. The backend receives the chain event before it gets the metadata
    //    update (POST) from the client (unlikely in real case scenarios)
    // 2. The backend gets the metadata update (POST) before it gets the chain
    //    event. It must save the metadata details with the transactionHash,
    //    so that the future call to createListingEventHandler is able to update the
    //    entry.
    insertListing: async (listing) => {
      const upsertObj = { new: true, upsert: true }
      const { txHash } = listing
      const res = await Listing.findOneAndUpdate({ txHash }, listing, upsertObj)
      return res
    },

    // Delete all documents
    clear: async () => {
      // Database clear
      logger.info('Clearing database')
      await Accounts.deleteMany({})
      await Listing.deleteMany({})
      await IPFSImage.deleteMany({})
      await Booking.deleteMany({})
      logger.info('Finished clearing database')
    },
  }
}

module.exports = Database
