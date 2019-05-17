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
    // By default, mongoose's findAndUpdate() uses findAndModify() function from the MongoDB
    // driver. This is deprecated. We would like to use the findAndUpdate() function
    // from MongoDB, to do so we set this to false.
    useFindAndModify: false,
    // As with the above we want to use MongoDB driver's functions instead of the old
    // and deprecated. Setting this to true is the way to do that.
    useCreateIndex: true,
  }

  const connectSync = async () => new Promise((resolve) => {
    mongoose.connection.on('error', (e) => {
      logger.error('Failed to connect to mongoose', e)
      resolve(false)
    })
    mongoose.connection.on('open', () => {
      logger.info('Connected to database')
      resolve(true)
    })
    mongoose.connect(connectStr, connectOpts)
  })

  const connect = () => {
    mongoose.connection.on('error', (e) => {
      logger.error('Failed to connect to mongoose', e)
    })
    mongoose.connection.on('open', () => {
      logger.info('Connected to database')
    })
    mongoose.connect(connectStr, connectOpts)
  }

  // Returns the ObjectId of the inserted entry.
  //
  // If a document with the same hash exists already, it's ObjectId
  // is returned, otherwise it is inserted first then returned.
  //
  // @image     an object with 'hash' and 'path' properties
  //
  const insertIpfsImage = async (image) => {
    const { hash } = image
    let obj = await IPFSImage.findOne({ hash })
    if (!isSet(obj)) {
      obj = await new IPFSImage(image).save()
    }
    return obj
  }

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
  //    entry. A list of images {hash: 'blabla', path: 'blabla'} is accepted, these
  //    images are inserted to ipfs_images then linked to the inserted listing using
  //    their ObjectIds (see also insertIpfsImage).
  const insertListing = async (listing) => {
    logger.silly(`database::insertListing ${listing.txHash}`)
    const upsertObj = { new: true, upsert: true }
    const { txHash, images } = listing
    // Listing object that will be inserted
    let toInsertListing = listing
    // Insert all 'images' provided in listing (if any)
    // and get their ObjectIds in 'imageIds'
    if (isSet(images)) {
      try {
        toInsertListing = {
          ...listing,
          // Insert all IPFS images
          images: await Promise.all(images.map(img => insertIpfsImage(img))),
        }
      } catch (err) {
        logger.error('Failed to insert IPFS images. Will do without')
      }
    }
    await Listing.findOneAndUpdate({ txHash }, toInsertListing, upsertObj)
  }

  // Delete all documents
  const clear = async () => {
    // Database clear
    logger.info('Clearing database')
    await Accounts.deleteMany({})
    await Listing.deleteMany({})
    await IPFSImage.deleteMany({})
    await Booking.deleteMany({})
    logger.info('Finished clearing database')
  }

  return {
    connectSync,
    connect,
    insertListing,
    insertIpfsImage,
    clear,
  }
}

module.exports = Database
