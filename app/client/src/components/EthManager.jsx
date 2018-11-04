import React, { Component } from "react"
import log from "../logger"
import { connect } from "react-redux"
import TruffleContract from 'truffle-contract'
import "../loadAbi.js"
import { refreshEth, createAccount, addMessage } from "../actions/"

var Web3 = require("web3")
var web3
const PROVIDER_STR = 'http://localhost:8545'

const ethEvents = {
  EvCreateAccount: {
    action: 'createAccount',
    message: 'Adding new account'
  }
}

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
    addMessage: (message) => dispatch(addMessage(message))
  }
}

class EthManager_ extends Component {

  constructor(props) {
    log.debug("EthManager_")
    super(props)
    // We start making connection to Ethereum Network
    this.setupEth()
  }

  async setupEth() {
    log.debug("setupEth")
    const eth = {}

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
    eth.web3 = web3
    eth.abi = abiArray.abi
    eth.accounts = web3.eth.accounts
    eth.MyContract = MyContract
    eth.contractInstance = contractInstance

    // Call callback
    this.props.refreshEth(eth)

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
    const self = this
    for (var eventName in ethEvents) {
      let {action, message} = ethEvents[eventName]
      let eventConstruct = this.props.eth.contractInstance[eventName]
      const ev = (error, result) => {
        if (error) {
          log.error(error)
        } else if (result) {
          const r = (result.constructor === Array) ? result : [result]
          for (var i = 0; i < r.length; i++) {
            self.props[action](r[i].args) // Execute UI action related to the EthEvent
            self.props.addMessage({ // Add message to MessageBoard
              text: message
            })
          }
        }
      }
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