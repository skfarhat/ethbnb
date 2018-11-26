const Web3 = require('web3')
const constants = require('./globals.const')
const { contractAddress, jsonInterface } = require('./loadAbi')

// Constants
const listingFunctions = {
  getListingPrice: 'price',
  getListingShortName: 'shortName',
  getListingMainImageHash: 'mainImageHash',
  getListingMainImageExtension: 'mainImageExtension',
}

const abi = jsonInterface.abi

// Show web3 where it needs to look for the Ethereum node.
const web3 = new Web3(new Web3.providers.WebsocketProvider(constants.PROVIDER_WS))
// Load ABI, then contract
const contract = new web3.eth.Contract(abi, contractAddress)

const listingEvents = ['CreateListingEvent', 'UpdateListingEvent']

module.exports = function (store) {
  return {
    registerEvents: async () => {
      const callback = async (err, result) => {
        console.log('newListingEvCallback')
        if (err) {
          console.log('NewListing: err', err)
        } else {
          const evs = (result.constructor === Array) ? result : [result]
          for (let i = 0; i < evs.length; i += 1) {
            const { lid, from } = evs[i].returnValues
            // console.log(lid, from)
            store.listings[lid] = {
              id: lid,
              from,
            }
            for (const func in listingFunctions) {
              let res
              const field = listingFunctions[func]
              try {
                const res = await contract.methods[func](lid).call({
                  from,
                })
                // console.log(`${func}, ${field} = '${res}'`)
                store.listings[lid][field] = res
                console.log(store.listings[lid])
              } catch (err) {
                console.log('Exception calling function: ', func)
                console.log(err)
              }
            }
          }
        }
      }

      Object.values(listingEvents).forEach((ev) => {
        console.log('Registering event', ev)
        contract.events[ev]({}, callback)
        // Search the contract events for the hash in the event logs and show matching events.
        contract.getPastEvents(ev, {
          fromBlock: 0,
          toBlock: 'latest',
        }, callback)
      })
    },
  }
}
