const Web3 = require('web3')
const Account = require('./models/Account')
const Listing = require('./models/Listing')
const Booking = require('./models/Booking')
const { contractAddress, jsonInterface } = require('./loadAbi')

const abi = jsonInterface.abi

// Show web3 where it needs to look for the Ethereum node.
const web3 = new Web3(new Web3.providers.WebsocketProvider(global.constants.PROVIDER_WS))
// Load ABI, then contract
const contract = new web3.eth.Contract(abi, contractAddress)

const listingFunctions = {
  price: 'getListingPrice',
  country: 'getListingCountry',
  location: 'getListingLocation',
}

const accountFunctions = {
  name: 'getAccountName',
  dateCreated: 'getAccountDateCreated',
}

// Module exports
// --------------
//
//    sync: function will register events defined in 'listingEvents' and map the blockchain contents
//          to those of the database.
//
//          callback will be called upon each database insertion if provided
//
module.exports = () => {
  const self = this

  // ==================================================================
  // DEFINITIONS
  // ==================================================================

  // Make callback it one has been provided
  const callbackIfExists = (data) => {
    if (self.callback) self.callback(data)
  }

  const addAccountToDatabase = async (account) => {
    logger.silly('addAccountToDatabase')
    const { addr } = account
    await Account.findOneAndUpdate({ addr }, account, { new: true, upsert: true })
  }

  // Create a listing model and save it to Mongo
  const addListingToDatabase = async (listing) => {
    logger.silly('addListingToDatbase')
    const { country, lid } = listing
    // {"new: true"} so that the modified/inserted is returned instead
    const listingModel = await Listing.findOneAndUpdate({ lid: listing.lid }, listing, { new: true, upsert: true })
    // Check for existing bookings in the database and update the listing's field
    const booking = await Booking.findOne({ lid })
    callbackIfExists(listingModel)
  }

  const addBookingToDatabase = async (booking) => {
    logger.silly('addBookingToDatabase')
    const bookingModel = await Booking.findOneAndUpdate({ bid: booking.bid, lid: booking.lid }, booking, { new: true, upsert: true })
    await Listing.findOneAndUpdate({ lid: booking.lid }, { $addToSet: { bookings: bookingModel._id } })
  }

  const fetchAndReturnAccount = async (addr) => {
    let res
    const account = {
      addr,
      nRatings: 0,
      totalScore: 0,
    }
    for (const field in accountFunctions) {
      const funcName = accountFunctions[field]
      try {
        res = await contract.methods[funcName](addr).call({ addr })
      } catch (err) {
        logger.error(`Error: Failed to call function ${funcName
        }Received error: ${err}`)
      }
      account[field] = res
    }
    return account
  }

  // Given a listing 'id' and 'from' address, this function reads
  // all of a listing's fields from the blockchain.
  const fetchAndReturnListing = async (lid, from) => {
    const l = {
      lid,
      owner: from,
    }
    for (const field in listingFunctions) {
      const funcName = listingFunctions[field]
      let res
      try {
        res = await contract.methods[funcName](lid).call({ from })
      } catch (err) {
        logger.error('Error: Failed to call function ', funcName, 'Received error: ', err)
      }
      l[field] = res
    }
    return l
  }

  // Given a 'bid' and 'from' address, this function reads
  // a booking's fields from the blockchain.
  const fetchAndReturnBooking = async (bid, lid, from) => {
    const b = {
      bid,
      lid,
      user: from,
    }
    try {
      const r = await contract.methods.getBookingDates(lid, bid).call({ from })
      b.from_date = r.from_date
      b.to_date = r.to_date
      return b
    } catch (exc) {
      logger.error(`Failed to call getBookingDates()${exc}`)
      throw exc
    }
  }

  const createAccountEventHandler = async (event) => {
    logger.silly('createAccountEventHandler')
    const { from } = event.returnValues
    const account = await fetchAndReturnAccount(from)
    await addAccountToDatabase(account)
  }

  // Create Listing object and add it to database
  const createListingEventHandler = async (event) => {
    logger.silly('createListingEventHandler')
    const { lid, from } = event.returnValues
    const listing = await fetchAndReturnListing(lid, from)
    await addListingToDatabase(listing)
  }

  // Find the cancelled booking and delete it if present
  const bookingCancelledEventHandler = async (event) => {
    logger.silly('bookingCancelledEventHandler - deleting booking')
    const { lid, bid, from } = event.returnValues
    const res = await Booking.delete({ bid })
    logger.debug(res)
  }

  // Create a Booking object and add it to database
  const bookingCompleteEventHanlder = async (event) => {
    const { lid, bid, from } = event.returnValues
    const booking = await fetchAndReturnBooking(bid, lid, from)
    await addBookingToDatabase(booking)
  }

  // Update the number of reviews and average rating
  // for the listings and users.
  // The 'booking' document is also updated to show who rated whom.
  //
  // Callback should fire after bookingComplete and others.
  const ratingCompleteEventHandler = async (event) => {
    logger.silly('ratingCompleteEventHandler')
    const { from, bid, lid, stars } = event.returnValues

    // Get booking and listing
    // We might have to wait for them as the event firing is asynchronouse
    // and RatingComplete relies on the Listing and Booking being present.
    //
    // FIXME: The below is not ideal but does the job for now.
    const WAIT_INTERVAL = 500 // usec
    let booking = await Booking.findOne({ bid, lid })
    let listing = await Listing.findOne({ lid }, { owner: 1, _id: 0 })
    while (!listing || !booking) {
      booking = await Booking.findOne({ bid, lid })
      listing = await Listing.findOne({ lid }, { owner: 1, _id: 0 })
      sleep(WAIT_INTERVAL)
    }
    // True if the guest is the one who is rating the owner
    const isGuestRater = from === booking.user
    // If the rater = guest, other = owner
    // If rater = owner, other = guest
    const other = (isGuestRater) ? listing.owner : booking.user

    // Update rating for Account 'other'
    await Account.findOneAndUpdate({ addr: other }, { $inc: { nRatings: 1 } })
    await Account.findOneAndUpdate({ addr: other }, { $inc: { totalScore: stars } })
    // Update rating for the listing
    await Listing.findOneAndUpdate({ lid }, { $inc: { nRatings: 1 } })
    await Listing.findOneAndUpdate({ lid }, { $inc: { totalScore: stars } })
    // Update rating on the booking
    const updateObj = (isGuestRater) ? { ownerRating: stars } : { guestRating: stars }
    await Booking.findOneAndUpdate({ lid, bid }, updateObj)
  }

  const eventCallbacks = {
    CreateAccountEvent: createAccountEventHandler,
    BookingComplete: bookingCompleteEventHanlder,
    BookingCancelled: bookingCancelledEventHandler,
    CreateListingEvent: createListingEventHandler,
    RatingComplete: ratingCompleteEventHandler,
  }

  // Calls the callback
  const eventDispatcher = (err, result) => {
    if (err) {
      console.log('Error: in eventDispatcher', err)
      return
    }
    const events = (result.constructor === Array) ? result : [result]
    for (const i in events) {
      const event = events[i]
      const eventName = event.event
      eventCallbacks[eventName](event)
    }
  }

  // ==================================================================
  // EXPORTS
  // ==================================================================

  return {
    // We register for past and future events of all events in 'eventCallbacks'
    // The callback 'eventDispatcher' is used for each event that arrives.
    sync: async (callback) => {
      self.callback = callback
      for (const eventName in eventCallbacks) {
        // Search the contract events for the hash in the event logs and show matching events.
        await contract.events[eventName]({}, eventDispatcher)
        await contract.getPastEvents(eventName, {
          fromBlock: 0,
          toBlock: 'latest',
        }, eventDispatcher)
      }
    },
  }
}
