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
const mongoose = require('mongoose')
const Database = require('./database')
var Listings = require('./models/Listing')
const { contractAddress, jsonInterface } = require('./loadAbi')
let bchain_to_db = require('./bchain_to_db')()

// ============================================================
// DEFINITIONS
// ============================================================


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
    title: 'London Victorian House', 
    description: `Good sized, basic double room in a 3 bed Shared flat situated in the heart of Holborn, 
    East Central London. The flat comprises of a fitted kitchen and a shared bathroom.`, 
  }, 
  2: {
    title: 'Lovely house at Croissy-Sur-Seine', 
    description: `Ouvry Manor - big place - jakuzzi - sauna - lovely spaceous garden - big DIY garage - 4 bedrooms
    and BABY-FOOT`, 
  }
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
  name: 'createListing',
  inputs: [
  { value: 226/* GB */, name: 'country' },
  { value: 'London', name: 'location' },
  { value: 1000, name: 'price' },
  ],
  constant: false,
  clientIndex: 0,
},
{
  name: 'createListing',
  inputs: [
  { value: '73'/* FR */, name: 'country' },
  { value: 'Paris', name: 'location' },
  { value: '20000', name: 'price' },
  ],
  constant: false,
  clientIndex: 0,
},
{
  name: 'createListing',
  inputs: [
  { value: '226'/* GB */, name: 'country' },
  { value: 'Cambridge', name: 'location' },
  { value: '3500', name: 'price' },
  ],
  constant: false,
  clientIndex: 1,
},
]

// ============================================================
// FUNCTIONS
// ============================================================

// Database clear 
const database_clear = async () => {
  logger.info('Clearing database')
  await Listings.deleteMany({})
  logger.info('Finished clearing database')
}

// Database print2
const database_print = async () => {
  logger.info('Database')
  console.log('--------------------------------------------')
  console.log(await Listings.find({}))
  console.log('--------------------------------------------')
}

// Find metadata associated with the given 'listing' and insert into the database
const add_metadata_to_listing = async (listing) => {
  let { lid } = listing
  try {
    lid = parseInt(lid)
    const listingModel = await Listings.findOne({lid})
    if (lid in listingMetadata) {
      const metadata = listingMetadata[lid]
      await Listings.findOneAndUpdate({lid}, metadata)
    }
  } catch (err) {
    console.log('Failed with', err)
  }
}

// Callback on listing database insert (when bchain_to_db.js inserts a chain entry to database)
const dbListingInsertCallback = async (listing) => {
  if (opts.metadata_add) {
    logger.info('Adding metadata')
    await add_metadata_to_listing(listing)
  }
  // Other functions to be called upon listing insertion
  // here: 
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
      const res = await method(..._in).send({ from, gas: 1000000 })
      console.log('succeeded: ', name)
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
}, (err) => {
  logger.error('Exception in run()', err)
})