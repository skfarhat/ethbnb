const Web3 = require('web3')
const Account = require('./models/Account')
const Listing = require('./models/Listing')
const Booking = require('./models/Booking')

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
module.exports = (database) => {
  this.database = database
  const { contractAddress, jsonInterface } = require('./loadAbi')
  const abi = jsonInterface.abi
  // Show web3 where it needs to look for the Ethereum node.
  const web3 = new Web3(new Web3.providers.WebsocketProvider(global.constants.PROVIDER_WS))
  // Load ABI, then contract
  const contract = new web3.eth.Contract(abi, contractAddress)

  // ==================================================================
  // DEFINITIONS
  // ==================================================================

  const addAccountToDatabase = async (account) => {
    logger.silly('addAccountToDatabase')
    const { addr } = account
    await Account.findOneAndUpdate({ addr }, account, { new: true, upsert: true })
  }

  const addBookingToDatabase = async (booking) => {
    logger.silly('addBookingToDatabase')
    const bookingModel = await Booking.findOneAndUpdate({ bid: booking.bid, lid: booking.lid }, booking, { new: true, upsert: true })
    await Listing.findOneAndUpdate({ lid: booking.lid }, { $addToSet: { bookings: bookingModel._id } })
  }

  const fetchAndReturnAccount = async (addr) => {
    const account = {
      addr,
      nRatings: 0,
      totalScore: 0,
    }
    const fields = ['name', 'dateCreated']
    const res = await contract.methods.getAccountAll(addr).call({ addr })
    Object.values(fields).forEach((field) => {
      account[field] = res[field]
    })
    return account
  }

  // Given a listing 'lid' and 'from' address, this function reads
  // all of a listing's fields from the blockchain
  // and returns a listing object.
  const fetchAndReturnListing = async (lid, from) => {
    const listing = {
      lid,
      owner: from,
    }
    const fields = ['price', 'owner', 'location', 'country', 'imageCID', 'imageCIDSource']
    const res = await contract.methods.getListingAll(lid).call({ from })
    Object.values(fields).forEach((field) => {
      listing[field] = res[field]
    })
    return listing
  }

  // Given a 'bid' and 'from' address, this function reads
  // a booking's fields from the blockchain.
  const fetchAndReturnBooking = async (bid, lid, from) => {
    const b = {
      bid,
      lid,
      guest: from,
    }
    try {
      const r = await contract.methods.getBookingDates(lid, bid).call({ from })
      b.fromDate = r.fromDate
      b.toDate = r.toDate
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

  /**
   * Reads the listing with given listing id from the blockchain
   * and updates the Mongo Document
   *
   * @param   event         The event object emitted
   */
  const syncListing = async (event) => {
    logger.silly('syncListing')
    const { lid, from } = event.returnValues
    const { transactionHash } = event
    const listing = Object.assign({ txHash: transactionHash }, await fetchAndReturnListing(lid, from))
    await database.upsertListing(listing)
  }

  // Find the cancelled booking and delete it if present
  const bookingCancelledEventHandler = async (event) => {
    logger.silly('bookingCancelledEventHandler - deleting booking')
    const { bid } = event.returnValues
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
    // We might have to wait for them as the event firing is asynchronous
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
    const isGuestRater = from === booking.guest
    // If the rater = guest, other = owner
    // If rater = owner, other = guest
    const other = (isGuestRater) ? listing.owner : booking.guest

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
    CreateListingEvent: syncListing,
    UpdateListingEvent: syncListing,
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
    sync: async () => {
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
