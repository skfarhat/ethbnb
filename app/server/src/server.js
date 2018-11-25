const Web3 = require('web3')
const app = require('./app')
const constants = require('./globals.const')
const { contractAddress, jsonInterface } = require('./loadAbi')

// Constants
const listingFunctions = {
  getListingPrice: 'price',
  getListingShortName: 'shortName',
  getListingMainImage: 'mainImage',
}

// Data store
const store = {
  listings: {},
}


// Debug
console.log(constants)

const abi = jsonInterface.abi

// Show web3 where it needs to look for the Ethereum node.
const web3 = new Web3(new Web3.providers.HttpProvider(constants.PROVIDER_STR))
// Load ABI, then contract
const contract = new web3.eth.Contract(abi, contractAddress)

const readAllCreateListingEvents = async () => {
  // Search the contract events for the hash in the event logs and show matching events.
  contract.getPastEvents('CreateListingEvent', {
    fromBlock: 0,
    toBlock: 'latest',
  }, async (error, events) => {
    if (error) {
      console.log('error', error)
    } else {
      // ListingEvents
      for (let i = 0; i < events.length; i += 1) {
        const { listingId, from } = events[i].returnValues
        // console.log('the listingId is ', listingId, event)
        store.listings[listingId] = {
          id: listingId,
          from,
        }
        for (const func in listingFunctions) {
          let res
          const field = listingFunctions[func]
          try {
            res = await contract.methods[func](listingId).call({
              from,
            })
            store.listings[listingId][field] = res
          } catch (err) {
            console.log('Exception calling function: ', func)
          }
          store.listings[listingId][field] = res
        }
      }
      console.log(store)
      console.log('---------------------------')
    }
  })
}

readAllCreateListingEvents().then((result) => {
  console.log('Nothing done here.')
}).catch((err) => {
  console.log('Caught an errror', err)
})

app.get('/listings', (req, res) => {
  res.json(store.listings)
})

app.listen(constants.PORT, () => {
  console.log(`Express server listening on port ${constants.PORT}`)
})
