import React, { Component } from 'react'
import Common from "./common.jsx"
import ClientsManager from "./client.jsx"
import APICaller from "./api-caller.jsx"
import TruffleContract from 'truffle-contract'
import "./loadAbi.js"
import './main.css'

var Web3 = require("web3")
var web3
const PROVIDER_STR = 'http://localhost:8545'

class App extends Component {
  constructor(props) {
    console.log('App: constructor')
    super(props)
    this.state = {
      num_clients: 3,
    }
    this.setupState()
  }

  async setupState() {
    console.log('App: setupState BEGIN')
    await this.setupEth()
    // This will be called after we're done setting up all eth, so we call setState
    // and trigger a redrawing of children
    this.setState(this.state)
    console.log('App: setupState DONE')
  }

  async setupEth() {
    console.log('App: setupEth')
    if (typeof web3 !== 'undefined') {
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }

    // Load ABI into contract
    const abiArray = window.abiArray // get it from somewhere
    console.log("Before creating TruffleContract")
    const MyContract = TruffleContract(abiArray)
    MyContract.setProvider(web3.currentProvider)
    const contractInstance = await MyContract.deployed()
    console.log("After creating contractInstance")

    // Set properties on `this.state.eth`
    this.state.web3 = web3
    this.state.accounts = web3.eth.accounts
    this.state.MyContract = MyContract
    this.state.contractInstance = contractInstance
  }

  render() {
    console.log('App: render')
    return (
      <div>
        <div id="div-top" className= "row">
          <Common />
        </div>
        <div id= "div-content" className="row" >
          <div id="clients-container" className="col-8" >
            <ClientsManager ctxt={this.state} />
          </div>
        <div id="api-container" className="col-4" >
          <APICaller ctxt={this.state} />
        </div>
      </div>
    </div>
    )
  }
}

export default App