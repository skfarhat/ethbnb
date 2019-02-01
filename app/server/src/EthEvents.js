const Web3 = require('web3')
const constants = require('./globals.const')
const { contractAddress, jsonInterface } = require('./loadAbi')
const abi = jsonInterface.abi

// TODO: encompass all in store, or make store accessible to all those that need
//       it.

// Show web3 where it needs to look for the Ethereum node.
const web3 = new Web3(new Web3.providers.WebsocketProvider(constants.PROVIDER_WS))
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
//    registerEvents: function will register events defined in 'listingEvents'
//                    and setup the necessary callback functions to populate 'store' with
//                    the right data from the blockchain. 
module.exports = function (store) {

  // ==================================================================
  // DEFINITIONS
  // ==================================================================

  // Add the listing argument to the store 
  const addListingToStore = (listing) => {
    const { country, lid } = listing
    store.listings[lid] = listing
    if (country !== undefined) {
      if ( !(country in store.listingsByCountry) ) {
        store.listingsByCountry[country] = []
      }
      store.listingsByCountry[country].push(listing)
    }
  }

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
        console.log('Error: Failed to call function ', funcName, 'Received error: ', err)
      }
      l[field] = res  
    }
    return l
  }

  const createListingEventHandler = async (event) => {
    console.log('createListingEventHandler')
    const { lid, from } = event.returnValues
    // Create Listing object and insert it in store
    const listing = await fetchAndReturnListing(lid, from)
    addListingToStore(listing)
  }

  const updateListingEventHanlder = (events) => {
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
    console.log('result', result)
    const events = (result.constructor === Array) ? result : [result]
    for (const i in events) {
      const event = events[i]
      const eventName = event.event
      console.log('eventName', eventName)
      console.log('eventName', eventCallbacks[eventName])
      eventCallbacks[eventName](event)
    }
  }

  // ==================================================================
  // EXPORTS
  // ==================================================================

  return {
    // We register for past and future events of all events in 'eventCallbacks'
    // The callback 'eventDispatcher' is used for each event that arrives.
    registerEvents: async () => {
      Object.keys(eventCallbacks).forEach((eventName) => {
        console.log('Registering event: ', eventName)
        contract.events[eventName]({}, eventDispatcher)
        // Search the contract events for the hash in the event logs and show matching events.
        contract.getPastEvents(eventName, {
          fromBlock: 0,
          toBlock: 'latest',
        }, eventDispatcher)
      })
    },
  }
}
