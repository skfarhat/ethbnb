import React, { Component } from "react"
import log from "../logger"
import { connect } from "react-redux"
import TruffleContract from 'truffle-contract'
import EthEventListener from './EthEventListener'
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
    dispatchMethods: {
      refreshEth: (eth) => dispatch(refreshEth(eth)),
      createAccount: (account) => dispatch(createAccount(account)),
      createListing: (listing) => dispatch(createListing(listing)),
      addMessage: (message) => dispatch(addMessage(message))
    }
  }
}

class EthManager_ extends Component {

  constructor(props) {
    log.debug("EthManager_")
    super(props)

    // The event listener will be instantiated when this.setupEth() completes
    // and registerEvents() will be invoked on the resulting object
    this.eventListener = null
    
    // We start making connection to Ethereum Network
    this.setupEth()

  }

  async setupEth() {
    log.debug("EthManager:: setupEth() start")
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
    this.props.dispatchMethods.refreshEth(this.eth)

    // Create EventListener and call registerEvents
    this.eventListener = new EthEventListener(contractInstance, this.props.dispatchMethods)
    this.eventListener.registerEvents()
    log.debug("EthManager:: setupEth() done")
  }

  getClientObjFromAddress(addr) {
    for (var i = 0; i < this.props.clients.length; i++) {
      if (this.props.clients[i].address === addr)
        return this.props.clients[i]
    }
    return null
  }

  render() {
    return (
      <div hidden={true}> Empty </div>
    )
  }
}

const EthManager = connect(mapStateToProps, mapDispatchToProps)(EthManager_)
export default EthManager