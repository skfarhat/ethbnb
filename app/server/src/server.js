const app = require('./app')

require('./globals')()
var Listings = require('./models/Listing')

const constants = global.constants 

const bchain_to_db = require('./bchain_to_db')()

// Setup database
const Database = require('./database')
const database = new Database(constants.db)

// Async call 
database.connect()

// Async call
bchain_to_db.sync()

// Allow CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  next()
})

// app.post('/api/listings/:lid/', async (req, res) => {
//   // https://ethereum.stackexchange.com/questions/35486/how-to-verify-metamask-account-holder-is-the-real-owner-of-the-address
//   // TODO: verify the user is the actual listing owner 
//   // var sig = getSignature() 
//   // const util = require('ethereumjs-util');
//   // const sig = util.fromRpcSig('<signature from front end>');
//   // const publicKey = util.ecrecover(util.sha3('test'), sig.v, sig.r, sig.s);
//   // const address = util.pubToAddress(publicKey).toString('hex');
//   // res.json({ message: 'Nothing done.' })
// })

app.get('/api/listings', async (req, res) => {
  logger.info('Serving content on /api/listings/')
  const allListings = await Listings.find({})
  res.json(allListings)
})

app.get('/api/listings/country/:country', async (req, res) => {
  let response = null
  const { country } = req.params
  try { 
    c = parseInt(country) 
  } catch(e) { 
    logger.error('Failed to parse country to integer') 
    res.json(response)
    return
  }
  response = await Listings.find({country: country})
  logger.info('Serving content on /api/listings/country/' + country)
  res.json(response)
})

app.listen(constants.PORT, () => {
  logger.info(`Express server listening on port ${constants.PORT}`)
})
