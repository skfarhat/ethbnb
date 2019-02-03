//
// Sami Farhat
// 
// Add testData to chain, then sync with database and insert metadata: 
//    $ node init_data.js --chain_init=true
// 
// Sync chain data with database, then add metadata defined here. 
//    $ node init_data.js --chain_init=false
//    $ node init_data.js
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

// Show web3 where it needs to look for the Ethereum node.
const abi = jsonInterface.abi
const web3 = new Web3(new Web3.providers.WebsocketProvider(global.constants.PROVIDER_WS))
// Load ABI, then contract
const contract = new web3.eth.Contract(abi, contractAddress)
const BN = web3.utils.BN
let accounts = null 
const listingMetadata = {
  1: {
    title: 'London Vitorian House', 
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

// Find metadata associated with the given 'listing' and insert into the database
const add_metadata_to_listing = (listing) => {
  let { lid } = listing
  try {
    lid = parseInt(lid)
    // if (typeof(lid) !== 'int') {
    //   console.log('ALERT lid - should be converted')
    // }
    // console.log(typeof(lid))
    // console.log(lid)
    console.log(lid)
    console.log(listingMetadata)
    const metadata = listingMetadata[lid]
    console.log('metadata', metadata)
  } catch (err) {
    console.log('Failed to convert lid to integer')
    console.log(err)
  }
}

// Callback on listing database insert (when bchain_to_db.js inserts a chain entry to database)
const dbListingInsertCallback = (listing) => {
  // console.log('Entry inserted into database ', listing)
  // add_metadata_to_listing(listing)
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
  const chain_init = ('chain_init' in args) ? args.chain_init === 'true' : false

  let res = null

  // Connect to database so that we can insert metadata in there 
  const database = new Database(global.constants.db)
  if (false === await database.connectSync()) {
    logger.error('Failed to connect?', res)
    return 
  }

  accounts = await web3.eth.getAccounts()
  
  // Inserts data on the chain to the database
  bchain_to_db.sync(dbListingInsertCallback)

  // Initialise blockchain with data if the command line flag 'chain_data' is set 
  if (chain_init === true) {
    await add_test_data_to_blockchain()
  }
}

run().then( (val) =>  {
}, (err) => {
  logger.error('Exception in run()', err)
})