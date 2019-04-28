const app = require('./app')
require('./globals')()

const Accounts = require('./models/Account')
var IPFSImage  = require('./models/IPFSImage')
const Listings = require('./models/Listing')
const Bookings = require('./models/Booking')

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

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

const isSet = val => {
  return val !== null && typeof(val) !== 'undefined'
}

// GET /api/account/:user
//
// :user account address for which bookings will be returned
//
app.get('/api/account/:user', async (req, res) => {
  const { user } = req.params
  const pipeline = [
      {
        $match: { addr: user }
      },
      {
        '$lookup': {
          from: 'bookings',
          localField: 'user',
          foreignField: 'addr',
          as: 'bookings',
        },
      },
      {
        $project: {
          _id: 0,
          __v: 0,
        }
      },
    ]
  const response = await Accounts.aggregate(pipeline)
  return res.json(response)
})

app.get('/api/listings', async (req, res) => {

  logger.info('Serving content on /api/listings/')
  let result
  // from_date and to_date are expected to be epoch seconds
  // we convert them to milliseconds if they are provided, otherwise they are passed as is (undefined or null)
  const pipeline = [
    {
      $lookup: {
        from: 'bookings',
        localField: 'bookings',
        foreignField: '_id',
        as: 'bookings',
      },
    },
    {
      $lookup: {
        from: 'ipfs_images',
        localField: 'images',
        foreignField: '_id',
        as: 'images',
      },
    },
    {
      $project: {
        _id: 0, _v: 0,
        'bookings._id': 0, 'bookings._v': 0,
      }
    }
  ]
  let { from_date, to_date, country_code } = req.query

  // Date options
  //
  // @from_date and @to_date are expected to be seconds formatted
  // and not milliseconds. We have to multiply by 1000 to get a date object.
  if (isSet(from_date) && isSet(to_date)) {
    from_date = new Date(from_date * 1000)
    to_date = new Date(to_date * 1000)
    // Add the match object at index 2 of the pipeline
    pipeline.splice(2, 0, {
      $match: {
        $and: [
          {
            $or: [
              { 'bookings.from_date': { $not: { $gte: from_date } } },
              { 'bookings.from_date': { $not: { $lt: to_date } } },
            ]
          },
          {
            $or: [
              { 'bookings.to_date': { $not: { $gte: from_date } } },
              { 'bookings.to_date': { $not: { $lt: to_date } } },
            ]
          },
        ]
      }
    })
  }
  // Country options
  if (isSet(country_code)) {
    // Insert at index = 0 of the pipeline
    pipeline.splice(0, 0, ({ '$match': { country: parseInt(country_code) } }))
  }
  let response = await Listings.aggregate(pipeline)
  await sleep(2000)
  return res.json(response)
})


app.listen(constants.PORT, () => {
  logger.info(`Express server listening on port ${constants.PORT}`)
})
