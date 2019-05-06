const minimist = require('minimist')
const path = require('path')
const { spawn } = require('child_process')
require('./globals')()

const SETUP_SCRIPT = path.join(__dirname, '../../../scripts/setup.sh')
const constants = global.constants
const webServer = require('./WebServer')
const Chain2DB = require('./Chain2DB')
const Database = require('./Database')
const DataManager = require('./DataManager')

async function asyncExec(command) {
  let stdout = ''
  return new Promise((resolve, reject) => {
    const child = spawn(command)
    child.addListener('error', reject)
    child.stdout.on('data', (data) => {
      console.log(data.toString())
      stdout += data
    })
    child.addListener('exit', code => resolve({ code, stdout }))
  })
}

// TODO: revisit how the chain2DB() and dataManager() need to happen
//       after the setup script.

// Parse Command Line
// ------------------
// If chain_init=true initialise the blockchain with data
const args = minimist(process.argv.slice(2))
args.initTestData = (hasKey(args, 'initTestData')) ? args.initTestData === 'true' : false

const database = Database(constants.db)

database.connectSync().then(async () => {
  if (args.initTestData) {
    // Run scripts/setup.sh which compiles the contract and migrates it
    // If needed:
    // const { errCode, stdout } = await asyncExec(SETUP_SCRIPT)
    await asyncExec(SETUP_SCRIPT)

    // The below two need to be constructed after loadAbi.js
    // is generated from the above setup script
    const chain2DB = Chain2DB()
    const dataManager = DataManager()

    // Clear the database
    await database.clear()

    // Chain2DB will setup event listeners which
    // will insert documents in the model for each chain event
    await chain2DB.sync()

    // Add test data to chain
    // createAccount, createListing, listingBook...
    await dataManager.addTestDataToChain()

    // Upload images to ipfs.infura.com
    // and insert them in the local database
    await dataManager.imagesAddToIPFSAndDB()

    // Add non-chain data to database
    // including the above images
    await dataManager.addListingMetadata()
  } else {
    // Chain2DB will setup event listeners which
    // will insert documents in the model for each chain event
    const chain2DB = Chain2DB()
    await chain2DB.sync()
  }

  // Async call
  // bchain_to_db.sync()

  webServer.listen()
}).catch((err) => {
  logger.error('Error: ', err)
  process.exit(1)
})
