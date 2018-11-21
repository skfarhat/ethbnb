import React, { Component } from "react"
import buffer from 'buffer'
import log from "../logger"
import { connect } from "react-redux"
import TruffleContract from 'truffle-contract'
import EthEventListener from './EthEventListener'
import ipfs from './IPFS'
import IPFSImage from './IPFSImage'
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

    // Setup local state to this component
    this.state = {
      ipfsHash: null
    }

    // The event listener will be instantiated when this.setupEth() completes
    // and registerEvents() will be invoked on the resulting object
    this.eventListener = null

    this.uploadPicture = this.uploadPicture.bind(this)

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

  // Uploads the image to IPFS and modifies the state with the returned hash
  async uploadPicture(evt) {
    console.log("EthManager:: uploadPicture")
    const self = this
    const reader = new FileReader();
    // Get the uploaded file image
    const photo = document.getElementById("image-file");
    const file = photo.files[0]
    reader.onloadend = function() {
      const buf = buffer.Buffer(reader.result) // Convert data into buffer
      console.log(reader.result)
      try {
        ipfs.files.add(buf, (err, result) => { // Upload buffer to IPFS
          if (err || !result) {
            console.error(err)
          } else {
            console.log(result)
            const hash = result[0].hash
            console.log("Changing state ", self.state)
            self.setState({
              ipfsHash: hash,
              file: file
            })
            console.log("Changed state ", self.state)
          }
        })
      } catch (err) {
        console.log('Exception thrown with error ', err)
      }
    }

    reader.readAsArrayBuffer(file); // Read Provided File
  }

  getClientObjFromAddress(addr) {
    for (var i = 0; i < this.props.clients.length; i++) {
      if (this.props.clients[i].address === addr)
        return this.props.clients[i]
    }
    return null
  }

  render() {
    console.log("Rendering EthBnb, IPFSImage hash=", this.state.ipfsHash)
    return (
      <div className="row" hidden={false}>
      <input
      id="image-file"
      key="button"
      className="btn btn-default"
      type="file"
      name="Add file to IPFS"
      />
      <div>
      <IPFSImage hash={this.state.ipfsHash} name={this.state.imageName}/>
      <button
      className="btn btn-default"
      onClick={(evt) => {
        this.uploadPicture(evt)
      }}
      >
      Get image
      </button>
      </div>
      </div>
    )
  }
}

const EthManager = connect(mapStateToProps, mapDispatchToProps)(EthManager_)
export default EthManager