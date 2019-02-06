const Web3 = require('web3')
const Listing = require('./models/Listing')
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


// Module exports
// --------------
// 
//    sync: function will register events defined in 'listingEvents' and map the blockchain contents
//          to those of the database. 
//          
//          callback will be called upon each database insertion if provided
//          
module.exports = function () {
  var self = this

  // ==================================================================
  // DEFINITIONS
  // ==================================================================

  // // Add the listing argument to the store 
  // const addListingToStore = (listing) => {
  //   const { country, lid } = listing
  //   store.listings[lid] = listing
  //   if (country !== undefined) {
  //     if ( !(country in store.listingsByCountry) ) {
  //       store.listingsByCountry[country] = []
  //     }
  //     store.listingsByCountry[country].push(listing)
  //   }
  // }
  

  // Make callback it one has been provided 
  const callbackIfExists = (data) => {
    if (self.callback)
      self.callback(data)
  }

  // Create a listing model and save it to Mongo  
  const addListingToDatabase = async (listing) => {
    logger.silly('addListingToDatbase')
    const { country, lid} = listing
    const listingModel = new Listing(listing)
    // {"new: true"} so that the modified/inserted is returned instead 
    let res = await Listing.findOneAndUpdate({lid: listing.lid}, listing, {new: true, upsert:true});
    callbackIfExists(res)
  }

  // Given a listing 'id' and 'from' address, this function reads 
  // all of a listing's fields from the blockchain. 
  const fetchAndReturnListing = async (lid, from) => {
    const l = {
      lid, from
    }
    for (const field in listingFunctions) {
      const funcName = listingFunctions[field]
      let res = undefined
      try {
        res = await contract.methods[funcName](lid).call({from,})
      } catch(err) {
        logger.error('Error: Failed to call function ', funcName, 'Received error: ', err)
      }
      l[field] = res  
    }
    return l
  }

  // Create Listing object and insert it in database
  const createListingEventHandler = async (event) => {
    logger.silly('createListingEventHandler')
    const { lid, from } = event.returnValues
    const listing = await fetchAndReturnListing(lid, from)
    await addListingToDatabase(listing)
  }

  const updateListingEventHanlder = async () => {
    // TODO: implement
  }

  const eventCallbacks = {
    'CreateListingEvent': createListingEventHandler,
    'UpdateListingEvent': updateListingEventHanlder
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
      Object.keys(eventCallbacks).forEach((eventName) => {
        logger.silly('Registering event: ' + eventName)
        // Search the contract events for the hash in the event logs and show matching events.
        contract.events[eventName]({}, eventDispatcher)
        contract.getPastEvents(eventName, {
          fromBlock: 0,
          toBlock: 'latest',
        }, eventDispatcher)
      })
    },
  }
}
