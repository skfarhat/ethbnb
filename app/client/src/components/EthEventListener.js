import log from "../logger"

// Manages the handling of the contract's emitted events by: 
// 
// (1) Making local ethereum calls to fetch latest: creations, deletions, updates..
// (2) Calling redux dispatch methods to update state. 
// 
// Dispatch methods are injected through the constructor (param: 'dispatchMethods')
// 
class EthEventListener {

  constructor(contractInstance, dispatchMethods) {
    log.debug("EthEventListener:: constructor()")
    this.contractInstance = contractInstance
    this.dispatchMethods = dispatchMethods
    this.ethEvents = {
      CreateAccountEvent: {
        callback: async (ethEvent) => {
          const {from} = ethEvent
          const account = await this.fetchAccountObject(from)
          this.dispatchMethods['createAccount'](account)
          this.dispatchMethods['addMessage']({
            text: 'Adding new account'
          })
        }
      },
      CreateListingEvent: {
        // When an event is raised saying a listing was created, we use the listing id from the
        // event to get all the details about the listing. We do that by making Eth calls
        // using call.
        callback: async (ethEvent) => {
          log.debug("callback call CreateListingEvent made", ethEvent)
          const {from, lid} = ethEvent
          const listing = await this.fetchListingObject(from, lid)

          // Raise action 'createListing'
          this.dispatchMethods['createListing'](listing)
          this.dispatchMethods['addMessage']({
            text: 'Adding a new listing'
          })
        }
      }
    }
  }

  // Given an eth account address return the BnB account associated with it 
  // accountObj: {name, dateCreated}
  async fetchAccountObject(from) {
    const callObj = {
      from: from,
      gas: 100000
    }
    const name = await this.contractInstance['getAccountName'].call(callObj)
    const dateCreated = await this.contractInstance['getAccountDateCreated'].call(callObj)
    return {
      from: from,
      name: name, 
      dateCreated: dateCreated
    }
  }

  // Given a listingId, this method will fetch the listing's properties and convert them to 
  // their appropriate types (BigNumber to integers...)
  async fetchListingObject(from, lid) {
    const callObj = {
      from: from,
      gas: 100000
    }
    const shortName = await this.contractInstance['getListingShortName'].call(lid,
      callObj)
    const price = await this.contractInstance['getListingPrice'].call(lid,
      callObj)
    const location = await this.contractInstance['getListingLocation'].call(lid,
      callObj)
    const mainImageHash = await this.contractInstance['getListingMainImageHash'].call(lid,
      callObj)
    const mainImageExtension = await this.contractInstance['getListingMainImageExtension'].call(lid,
      callObj)
    return {
      from,
      price: parseInt(price.toString(), 10),
      id: parseInt(lid.toString(), 10),
      shortName,
      location,
      mainImageHash,
      mainImageExtension
    }
  }

  registerEvents() {
    log.debug("EthEventListener:: registerEvents")
    for (var eventName in this.ethEvents) {
      let {callback} = this.ethEvents[eventName]
      let eventConstruct = this.contractInstance[eventName]
      const ev = (error, result) => {
        log.debug("Eth event:: ", result)
        if (error) {
          log.error(error)
        } else if (result) {
          const r = (result.constructor === Array) ? result : [result]
          for (var i = 0; i < r.length; i++) {
            if (callback)
              callback(r[i].args)
          }
        }
      }
      // BUG: There's something not quite right here.
      //      I'm getting duplicates, so one of them has to go. Keeping the watch one for the
      //      being.
      eventConstruct().watch(ev) // Get all future events
      eventConstruct({}, { // Get all past events
        fromBlock: 0,
        toBlock: 'latest'
      }).get(ev)
    }
  }
}

export default EthEventListener
