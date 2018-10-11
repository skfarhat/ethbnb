import React, { Component } from 'react'
import Common from "./Common.jsx"
import ClientsManager from "./Client.jsx"
import APICaller from "./APICaller.jsx"
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
    this.NUM_CLIENTS = 3
    this.state = {
      clients: []
    }
    // Dictionary organising clients by (key->value)
    // 'string address'->'int index'
    // where the index represents the client object referenced
    // in this.state.clients
    this.clientsDict = {}
    // Async method
    this.setupState()
  }

  async setupState() {
    console.log('App: setupState BEGIN')
    await this.setupEth()
    console.log('App: setupState DONE')
  }

  async setupEth() {
    console.log('App: setupEth')
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

    // Set properties on `this.state.eth`
    this.state.web3 = web3
    this.state.accounts = web3.eth.accounts
    this.state.MyContract = MyContract
    this.state.contractInstance = contractInstance

    // Create the clients and add watchers for each
    let clients = []
    for (var i = 0; i < this.NUM_CLIENTS; i++) {
      clients[i] = {
        "address": this.state.accounts[i],
        "account": null,
        "listings": null
      }
      this.clientsDict[this.state.accounts[i]] = i
    }

    // Setup event listener for CreateAccountEv
    var self = this
    var ContractInstance = this.state.contractInstance
    var createAccountEv = ContractInstance.EvCreateAccount()

    var createAccountEvHandler = function(error, result) {
      console.log("createAccountEvHandler")
      console.log(error)
      console.log(result)
      for (var i = 0; i < result.length; i++) {
        var ev = result[i]
        const {from, name, dateCreated} = ev.args
        var client = self.getClientObjFromAddress(from)
        client.account = {
          name: name,
          dateCreated: dateCreated,
        }
      }

      // self.forceUpdate()
      self.setState(self.state)
      // console.log("SetState")
    }

    // Get all future events
    createAccountEv.watch(createAccountEvHandler)

    // Get all past events
    ContractInstance.EvCreateAccount({}, {
      fromBlock: 0,
      toBlock: 'latest'
    }).get(createAccountEvHandler);

    var toSet = {
      clients: clients,
      num_clients: this.NUM_CLIENTS
    }
    // Change state after all eth is setup to re-render child components
    this.setState(toSet)
    console.log("setState called again..", toSet)
  }

  // Given the account address for a client, return the client object
  getClientObjFromAddress(address) {
    if (address in this.clientsDict)
      return this.state.clients[this.clientsDict[address]]
    else
      return null
  }

  render() {
    console.log('App: render')
    return (
      <div>
          <Common />
          <ClientsManager clients={this.state.clients} />
          <APICaller eth={this.state} />
      </div>
    )
  }
}

export default App