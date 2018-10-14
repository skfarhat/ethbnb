import React, { Component } from "react"
import { connect } from "react-redux"
import TruffleContract from 'truffle-contract'
import "../loadAbi.js"
import { refreshEth } from "../actions/"

var Web3 = require("web3")
var web3
const PROVIDER_STR = 'http://localhost:8545'

const mapDispatchToProps = dispatch => {
  return {
    refreshEth: (eth) => dispatch(refreshEth(eth))
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
    eth.abiArray = abiArray
    eth.accounts = web3.eth.accounts
    eth.MyContract = MyContract
    eth.contractInstance = contractInstance

    this.props.refreshEth(eth)
  }

  render() {
    return (
      <div hidden={true}> Empty </div>
    )
  }
}

const EthManager = connect(null, mapDispatchToProps)(ConnectedEthManager)
export default EthManager