const app = require('./app')
require('./globals')()
var IPFSImage  = require('./models/IPFSImage')
const Listings = require('./models/Listing')
const Bookings = require('./models/Booking')

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

app.get('/api/listings', async (req, res) => {
  logger.info('Serving content on /api/listings/')
  let result
  // from_date and to_date are expected to be epoch seconds
  // we convert them to milliseconds if they are provided, otherwise they are passed as is (undefined or null)
  let { from_date, to_date } = req.query
  from_date = (from_date !== null && typeof(from_date) !== 'undefined') ? new Date(from_date * 1000) : from_date
  to_date = (to_date !== null && typeof(to_date) !== 'undefined') ? new Date(to_date * 1000) : to_date
  return res.json(await Listings.aggregate([
    {
      '$lookup': {
        from: 'bookings',
        localField: 'bookings',
        foreignField: '_id',
        as: 'bookings',
      },
    },
    {
      '$lookup': {
        from: 'ipfs_images',
        localField: 'images',
        foreignField: '_id',
        as: 'images',
      },
    },
    {
      '$match': {
        'bookings.from_date': { '$not': {'$gte': from_date} },
        'bookings.to_date': { '$not': {'$lte': to_date} }
      }
    }
    ])
  )
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
  response = await Listings.find({country: country}).populate({path: 'images', model: 'ipfs_images'})
  logger.info('Serving content on /api/listings/country/' + country)
  res.json(response)
})

app.listen(constants.PORT, () => {
  logger.info(`Express server listening on port ${constants.PORT}`)
})
