import React, { Component } from "react"
import { connect } from "react-redux"
import TruffleContract from 'truffle-contract'
import "../loadAbi.js"
import { refreshEth, createAccount } from "../actions/"

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
    createAccount: (account) => dispatch(createAccount(account))
  }
}

class ConnectedEthManager extends Component {
  constructor(props) {
    super(props)
    // We start making connection to Ethereum Network
    this.setupEth()
  }

  async setupEth() {
    console.log('EthManager: setupEth')
    const eth = {}

    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      // Set the provider you want from Web3.providers
      web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER_STR));
    }
    console.log(web3.version)

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
    console.log("registerEvents", this.props)
    const self = this
    // Setup event listener for CreateAccountEv
    var ContractInstance = this.props.eth.contractInstance
    var createAccountEv = ContractInstance.EvCreateAccount()

    const ev = (error, result) => {
      const r = (result.constructor === Array) ? result : [result]
      for (var i = 0; i < r.length; i++) {
        self.props.createAccount(r[i].args)
      }
    }

    // Get all future events
    createAccountEv.watch(ev)

    // Get all past events
    ContractInstance.EvCreateAccount({}, {
      fromBlock: 0,
      toBlock: 'latest'
    }).get(ev);
  }

  render() {
    return (
      <div hidden={true}> Empty </div>
    )
  }
}

const EthManager = connect(mapStateToProps, mapDispatchToProps)(ConnectedEthManager)
export default EthManager