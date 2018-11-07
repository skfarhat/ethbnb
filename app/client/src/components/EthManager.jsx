import React, { Component } from "react"
import log from "../logger"
import { connect } from "react-redux"
import TruffleContract from 'truffle-contract'
import "../loadAbi.js"
import { refreshEth, createAccount, addMessage, createListing } from "../actions/"

var Web3 = require("web3")
var web3
const PROVIDER_STR = 'http://localhost:8545'

const mapStateToProps = (state) => {
  return {
    eth: state.eth,
    clients: state.clients
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    refreshEth: (eth) => dispatch(refreshEth(eth)),
    createAccount: (account) => dispatch(createAccount(account)),
    createListing: (listing) => dispatch(createListing(listing)),
    addMessage: (message) => dispatch(addMessage(message))
  }
}

class EthManager_ extends Component {

  constructor(props) {
    log.debug("EthManager_")
    super(props)

    this.ethEvents = {
      CreateAccountEvent: {
        message: 'Adding new account',
        callback: async (ethEvent) => {
          const account = ethEvent // TODO: make this consistent with CreateListingEvent
          this.props['createAccount'](account)
          this.props['addMessage']({
            text: 'Adding new account'
          })
        }
      },
      CreateListingEvent: {
        message: 'Adding new listing',
        // When an event is raised saying a listing was created, we use the listing id from the
        // event to get all the details about the listing. We do that by making Eth calls
        // using call.
        callback: async (ethEvent) => {
          log.debug("callback call CreateListingEvent made", ethEvent)
          const {from, listingId} = ethEvent
          const callObj = {
            from: from,
            gas: 100000
          }
          const shortName = await this.eth.contractInstance['getListingShortName'].call(listingId,
            callObj)
          const price = await this.eth.contractInstance['getListingPrice'].call(listingId,
            callObj)
          const location = await this.eth.contractInstance['getListingLocation'].call(listingId,
            callObj)
          const listing = {
            price: parseInt(price.toString()),
            from: from,
            id: parseInt(listingId.toString()),
            shortName: shortName,
            location: location
          }
          // Raise action 'createListing'
          this.props['createListing'](listing)
          this.props['addMessage']({
            text: 'Adding a new listing'
          })
        }
      }
    }
    // We start making connection to Ethereum Network
    this.setupEth()

  }

  async setupEth() {
    log.debug("setupEth")
    this.eth = {}

    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      // Set the provider you want from Web3.providers
      web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_STR));
    }
    log.debug(web3.version)

    // Load ABI into contract
    const abiArray = window.abiArray // get it from somewhere
    const MyContract = TruffleContract(abiArray)
    MyContract.setProvider(web3.currentProvider)
    const contractInstance = await MyContract.deployed()

    // Set properties on 'eth'
    this.eth.web3 = web3
    this.eth.abi = abiArray.abi
    this.eth.accounts = web3.eth.accounts
    this.eth.MyContract = MyContract
    this.eth.contractInstance = contractInstance

    // Call callback
    this.props.refreshEth(this.eth)

    // Register event listeners
    this.registerEvents()
  }

  getClientObjFromAddress(addr) {
    for (var i = 0; i < this.props.clients.length; i++) {
      if (this.props.clients[i].address === addr)
        return this.props.clients[i]
    }
    return null
  }

  registerEvents() {
    log.debug("registerEvents", this.props)
    for (var eventName in this.ethEvents) {
      let {callback} = this.ethEvents[eventName]
      let eventConstruct = this.props.eth.contractInstance[eventName]
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

  render() {
    return (
      <div hidden={true}> Empty </div>
    )
  }
}

const EthManager = connect(mapStateToProps, mapDispatchToProps)(EthManager_)
export default EthManager