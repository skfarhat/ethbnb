const app = require('./app')
const constants = require('./globals.const')

// Data store
const store = {
  listings: {},
  listingsByCountry: {}, 
}

const EthEvents = require('./EthEvents')(store)

// Async call
EthEvents.registerEvents()

// Allow CORS
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  next()
})

app.get('/api/listings', (req, res) => {
  console.log('Serving content on /api/listings/', store.listings)
  res.json(store.listings)
})

app.get('/api/listings/country/:country', (req, res) => {
  const { country } = req.params
  console.log('Serving content on /api/listings/country/' + country)
  res.json(store.listingsByCountry[country])
})

app.listen(constants.PORT, () => {
  console.log(`Express server listening on port ${constants.PORT}`)
})
