const express = require('express')
const bodyParser = require('body-parser')

const constants = global.constants
const app = express()
const Accounts = require('./models/Account')
const Listings = require('./models/Listing')
const Bookings = require('./models/Booking')

module.exports = {
  listen: () => {
    // Support application/json type post data
    app.use(bodyParser.json())
    // Support application/x-www-form-urlencoded post data
    app.use(bodyParser.urlencoded({ extended: false }))

    // Allow CORS
    app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
      next()
    })

    // GET /api/public/account/:user
    //
    // Public call to account returns name, addr and dateCreated
    //
    app.get('/api/public/account/:user', async (req, res) => {
      const { user } = req.params
      const fields = {
        _id: 0,
        name: 1,
        dateCreated: 1,
        addr: 1,
      }
      const result = await Accounts.findOne({ addr: user }, fields).lean()
      return res.json(result)
    })

    // GET /api/account/:user
    //
    // Returns all information on the given user, this call
    // will likely need to add authentication later (TODO)
    // :user account address for which bookings will be returned
    //
    app.get('/api/account/:user', async (req, res) => {
      const { user } = req.params
      const bookingsPipeline = [
        {
          $match: { user },
        },
        {
          $lookup: {
            from: 'listings',
            localField: 'lid',
            foreignField: 'lid',
            as: 'listing',
          },
        },
        {
          $unwind: '$listing',
        },
      ]
      const account = await Accounts.findOne({ addr: user }).lean()
      account.bookings = await Bookings.aggregate(bookingsPipeline)
      // Drop __id and __v
      delete account._id
      delete account.__v
      return res.json(account)
    })

    app.get('/api/listings', async (req, res) => {
      logger.info('Serving content on /api/listings/')
      // from_date and to_date are expected to be epoch seconds
      // we convert them to milliseconds if they are provided,
      // otherwise they are passed as is (undefined or null)
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
            _id: 0,
            _v: 0,
            'bookings._id': 0,
            'bookings._v': 0,
          },
        },
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
                ],
              },
              {
                $or: [
                  { 'bookings.to_date': { $not: { $gte: from_date } } },
                  { 'bookings.to_date': { $not: { $lt: to_date } } },
                ],
              },
            ],
          },
        })
      }
      // Country options
      if (isSet(country_code)) {
        // Insert at index = 0 of the pipeline
        pipeline.splice(0, 0, ({ $match: { country: parseInt(country_code, 10) } }))
      }
      const response = await Listings.aggregate(pipeline)
      await sleep(2000)
      return res.json(response)
    })

    app.listen(constants.PORT, () => {
      logger.info(`Express server listening on port ${constants.PORT}`)
    })
  },
}
