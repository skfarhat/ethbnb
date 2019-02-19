//
// Sami Farhat
//
// Add testData to chain, then sync with database and insert metadata:
//    $ node data_manage.js --chain_init=true
//
// Sync chain data with database, then add metadata defined here.
//    $ node data_manage.js --chain_init=false
//    $ node data_manage.js
//

// ============================================================
// REQUIRE
// ============================================================

require('./globals')()
const minimist = require('minimist')
const Web3 = require('web3')
const fs = require('fs')
const path = require('path')
const mongoose = require('mongoose')
const ipfsAPI = require('ipfs-api')
const Database = require('./database')
const Listings = require('./models/Listing')
const Bookings = require('./models/Booking')
const IPFSImage = require('./models/IPFSImage')
const { contractAddress, jsonInterface } = require('./loadAbi')
const bchain_to_db = require('./bchain_to_db')()

// ============================================================
// DEFINITIONS
// ============================================================

const FEB_10 = 1549756800 // February 10 2019 - 00:00
const FEB_15 = 1550188800 // February 15 2019 - 00:00
const FEB_17 = 1550361600 // February 17 2019 - 00:00
const FEB_18 = 1550448000 // February 18 2019 - 00:00

// Directory path to listing images
const LISTING_IMGS_PATH = path.join(__dirname, "imgs/listings")

// Options set via command line arguments Command line arguments
const opts = {}

// Show web3 where it needs to look for the Ethereum node.
const abi = jsonInterface.abi
const web3 = new Web3(new Web3.providers.WebsocketProvider(global.constants.PROVIDER_WS))
// Load ABI, then contract
const contract = new web3.eth.Contract(abi, contractAddress)
const BN = web3.utils.BN
let accounts = null

const listingMetadata = {
  1: {
    title: '53 Devonshire-on-Rails',
    description: `Welcome to the super awesome Devonshire place now that Sophie has left.`,
    images: [ "1.jpg" ],
  },
  2: {
    title: 'Lovely house at Croissy-Sur-Seine',
    description: `Ouvry Manor - big place - jakuzzi - sauna - lovely spaceous garden - big DIY garage - 4 bedrooms
    and BABY-FOOT`,
    images: [ "2.jpeg" ],
  },
  3: {
    title: 'London Victorian House',
    description: `Good sized, basic double room in a 3 bed Shared flat situated in the heart of Holborn,
    East Central London. The flat comprises of a fitted kitchen and a shared bathroom.`,
    images: [ "3.jpg" ],
  },
  4: {
    title: 'Farhat Manor',
    description: `Lovely house`,
  },
  5: {
    title: 'Mobader residence',
    description: `Lovely Saida residence next to Ain-el-Helwe. Stay next door to the lovely Im Wassim.`,
  },
}

const testData = [
  {
    name: 'createAccount',
    inputs: [{ value: 'Sami Farhat' }],
    constant: false,
    clientIndex: 0,
  },
  {
    name: 'createAccount',
    inputs: [{ value: 'Marwan Mobader' }],
    constant: false,
    clientIndex: 1,
  },
  {
    name: 'createAccount',
    inputs: [{ value: 'Margaux Ouvry' }],
    constant: false,
    clientIndex: 2,
  },
  {
    // lid:1
    name: 'createListing',
    inputs: [
    { value: 65/* GB */, name: 'country' },
    { value: 'Cambridge', name: 'location' },
    { value: 600, name: 'price' },
    ],
    constant: false,
    clientIndex: 0,
  },
  {
    // lid:2
    name: 'createListing',
    inputs: [
    { value: '75'/* FR */, name: 'country' },
    { value: 'Paris', name: 'location' },
    { value: '2000', name: 'price' },
    ],
    constant: false,
    clientIndex: 2,
  },
  {
    // lid:3
    name: 'createListing',
    inputs: [
    { value: '65'/* GB */, name: 'country' },
    { value: 'London', name: 'location' },
    { value: '1799', name: 'price' },
    ],
    constant: false,
    clientIndex: 1,
  },
  {
    // lid:4
    name: 'createListing',
    inputs: [
    { value: '118'/* LB */, name: 'country' },
    { value: 'Beirut', name: 'location' },
    { value: '700', name: 'price' },
    ],
    constant: false,
    clientIndex: 0,
  },
  {
    // lid:5
    name: 'createListing',
    inputs: [
    { value: '118'/* LB */, name: 'country' },
    { value: 'Saida', name: 'location' },
    { value: '300', name: 'price' },
    ],
    constant: false,
    clientIndex: 1,
  },
  {
    // lid: 1
    name: 'listingBook',
    inputs: [
      { value: 1, name: 'listingId' },
      { value: FEB_10, name: 'from_date' },
      { value: 1, name: 'nb_days' },
    ],
    constant: false,
    clientIndex: 0,
  }
]

// ============================================================
// FUNCTIONS
// ============================================================

// Database clear
const database_clear = async () => {
  logger.info('Clearing database')
  await Listings.deleteMany({})
  await IPFSImage.deleteMany({})
  await Bookings.deleteMany({})
  logger.info('Finished clearing database')
}

// Database print
const database_print = async () => {
  logger.info('Database')
  console.log('--------------------------------------------')
  console.log(await Listings.find({}))
  console.log(await IPFSImage.find({}))
  console.log('--------------------------------------------')
}

// Return an array of IPFS details of the images added
// to IPFS.
const images_add_to_ipfs_and_db = async () => {
  logger.silly('images_add_to_ipfs')
  const ipfs = ipfsAPI('ipfs.infura.io', '5001', { protocol: 'https' })
  logger.info('IPFS connected')

  // Filter files and keep only image related ones
  let images = fs.readdirSync(LISTING_IMGS_PATH).filter((filename) =>
    [".png", ".jpg", ".jpeg"].findIndex(x => x === path.extname(filename)) > -1
  )

  // For each image file:
  //    - Add it to IPFS
  //    - Add it to local database
  for (let img of images) {

    // If image already exists in database, continue without
    if (0 !== await IPFSImage.count({path: img}))
      continue

    try {
      const filepath = `${LISTING_IMGS_PATH}/${img}`
      // Add image to ipfs
      let result = await ipfs.util.addFromFs(filepath, { recursive: true })
      if (result.length === 0) {
        throw new Error('ipfs.util.addFromFs returned zero-length result')
      }
      // Add ipfs image to database
      await (new IPFSImage(result[0])).save() // get the first item from the array
      logger.info('Added image ' + filepath + ' to IPFS and local database.')
    } catch (err) {
      console.log(err)
      return null
    }
  }
}

// Find metadata associated with the given 'listing' and insert into the database
const add_metadata_to_listing = async (listing) => {
  let { lid } = listing
  try {
    lid = parseInt(lid)
    const listingModel = await Listings.findOne({lid})
    if (lid in listingMetadata && typeof listingMetadata[lid].images !== 'undefined' ) {
      const meta = listingMetadata[lid]
      // Replace each image file path in the model with the ObjectId referencing the actual document.
      meta.images = await Promise.all(meta.images.map(async (imgName) =>
        await IPFSImage.findOne({ path: imgName }))
      )
      await Listings.findOneAndUpdate({lid}, meta)
    }
  } catch (err) {
    console.log('Failed with', err)
  }
}

// Callback on listing database insert (when bchain_to_db.js inserts a chain entry to database)
const dbListingInsertCallback = async (listing) => {
  if (opts.metadata_add) {
    await add_metadata_to_listing(listing)
  }
  // Other functions to be called upon listing insertion here:
  // ...
}

const addressFromClientIndex = (index) => {
  return accounts[index]
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const add_test_data_to_blockchain = async () => {
  logger.silly('add_test_data_to_blockchain')
  // All functions in testData are expected to be non-constant: we send a transaction
  // to execute each.
  for (const i in testData) {
    const { name, inputs, clientIndex } = testData[i]
    const _in = inputs.map(x => x.value)
    const from = addressFromClientIndex(clientIndex)
    try {
      const method = contract.methods[name]
      await method(..._in).send({ from, gas: 1000000 })
    } catch (e) {
      console.log(e)
      logger.error(e)
      logger.error('sendTransaction call failed: ' + name)
    }
  }
}

const run = async () => {
  // Command line arguments
  //
  // If chain_init=true initialise the blockchain with data
  const args = minimist(process.argv.slice(2))
  opts.chain_init = ('chain_init' in args) ? args.chain_init === 'true' : false
  opts.db_clear = ('db_clear' in args) ? args.db_clear === 'true' : false
  opts.metadata_add = ('metadata_add' in args) ? args.metadata_add === 'true' : false
  opts.db_print = ('db_print' in args) ? args.db_print === 'true' : false

  // Connect to database so that we can insert metadata in there
  const database = new Database(global.constants.db)
  if (false === await database.connectSync()) {
    logger.error('Failed to connect')
    process.exit(1)
  }

  // Clear database and exit if 'opts.db_clear=true'
  if (opts.db_clear) {
    await database_clear()
    process.exit(0)
  } else {
    accounts = await web3.eth.getAccounts()

    if (opts.metadata_add) {
      await images_add_to_ipfs_and_db()
    }

    // Call sync() on bchain_to_db which inserts listings in the database
    // when it receives Eth events.
    bchain_to_db.sync(dbListingInsertCallback)

    // Add test data to chain if 'opts.chain_init === true'
    if (opts.chain_init === true) {
      await add_test_data_to_blockchain()
    }

    // -------------------------
    // PRINT DATABASE
    // -------------------------
    if (opts.db_print === true)
      await database_print()

    // -------------------------
    // EXIT
    // -------------------------
    logger.info('Exiting in 5 seconds')
    await sleep(5000)
    process.exit(0)

  }
}

run().then( (val) =>  {
  logger.info(val)
}, (err) => {
  console.log('Exception in run()')
  console.log(err)
})