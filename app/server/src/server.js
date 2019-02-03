const app = require('./app')

require('./globals')()
var Listings = require('./models/Listing')

const constants = global.constants 

// Data store
const store = {
  listings: {},
  listingsByCountry: {}, 
}

const EthEvents = require('./EthEvents')(store)

// Setup database
const Database = require('./database')
const database = new Database(constants.db)

// Async call 
database.connect()

// Async call
EthEvents.registerEvents()

// Allow CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  next()
})

app.get('/api/listings', async (req, res) => {
  logger.info('Serving content on /api/listings/', store.listings)
  const allListings = await Listings.find({})
  res.json(allListings)
})

app.get('/api/listings/country/:country', async (req, res) => {
  let response = null
  const { country } = req.params
  try { c = parseInt(country) }
  catch(e) { logger.error('Failed to parse country to integer') }
  response = await Listings.find({country: country})
  logger.info('Serving content on /api/listings/country/' + country)
  res.json(response)
})

app.listen(constants.PORT, () => {
  logger.info(`Express server listening on port ${constants.PORT}`)
})
