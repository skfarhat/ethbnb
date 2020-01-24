const minimist = require('minimist')
const path = require('path')
const { spawn } = require('child_process')
require('./globals')()

const SETUP_SCRIPT = path.join(__dirname, '../../scripts/setup.sh')
const constants = global.constants
const WebServer = require('./WebServer')
const Chain2DB = require('./Chain2DB')
const Database = require('./Database')
const TestDataAdder = require('./TestDataAdder')

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

// Parse Command Line
// ------------------
// If chain_init=true initialise the blockchain with data
const args = minimist(process.argv.slice(2))
args.initTestData = (hasKey(args, 'initTestData')) ? args.initTestData === 'true' : false

const database = Database(constants.db)
const webServer = WebServer(database)

database.connectSync().then(async () => {
  if (args.initTestData) {
    // Run scripts/setup.sh which compiles the contract and migrates it
    // If needed:
    // const { errCode, stdout } = await asyncExec(SETUP_SCRIPT)
    await asyncExec(SETUP_SCRIPT)

    // Clear the database
    await database.clear()
  }

  // The below two need to be constructed after loadAbi.js
  // is generated from the above setup script
  const chain2DB = Chain2DB(database)
  const testDataAdder = TestDataAdder(database)

  // Chain2DB will setup event listeners which
  // will insert documents in the model for each chain event
  await chain2DB.sync()

  if (args.initTestData) {
    // Add test data to chain
    // createAccount, createListing, listingBook...
    await testDataAdder.addTestDataToChain()
  }

  webServer.listen()
}).catch((err) => {
  logger.error(err)
  process.exit(1)
})
