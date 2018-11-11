import React, { Component } from "react"
import log from "../logger"
import { connect } from "react-redux"
import TruffleContract from 'truffle-contract'
import EthEventListener from './EthEventListener'
import ipfs from './IPFS'
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

// public method for encoding an Uint8Array to base64
// Shamelessly stolen off some stackoverflow response
function encode(input) {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1,
    chr2,
    chr3,
    enc1,
    enc2,
    enc3,
    enc4;
  var i = 0;

  while (i < input.length) {
    chr1 = input[i++];
    chr2 = i < input.length ? input[i++] : Number.NaN; // Not sure if the index 
    chr3 = i < input.length ? input[i++] : Number.NaN; // checks are needed here

    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;

    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output += keyStr.charAt(enc1) + keyStr.charAt(enc2) +
    keyStr.charAt(enc3) + keyStr.charAt(enc4);
  }
  return output;
}

class EthManager_ extends Component {

  constructor(props) {
    log.debug("EthManager_")
    super(props)

    this.uploadPicture = this.uploadPicture.bind(this)
    this.getImage = this.getImage.bind(this)
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

  async uploadPicture(evt) {
    const self = this
    console.log('uploadPicture', evt.target.files)
    const files = Array.from(evt.target.files)
    log.debug('uploadPicture')
    const data = new FormData()
    const file = files[0]
    data.append('file', file, file.name)
    console.log('the data is ', data)

    var reader = new FileReader();
    reader.onload = async function(e) {
      // var buff = reader.result;
      // console.log("read the file as ", buff)
      //file is converted to a buffer for upload to IPFS
      const buff = await Buffer.from(reader.result);
      await ipfs.add(buff, (err, ipfsHash) => {
        if (err) {
          console.log("we hit an error", err)
        } else {
          console.log("the ipfs hash is ", err, ipfsHash)
        }
        self.ipfs = {
          ipfsInstance: ipfsHash,
        }
      })
    }



    reader.readAsBinaryString(file);
  // // TODO: read the file image we want to post 
  // //       and have it be in a buffer 
  // const photoBuffer = {}
  // await ipfs.add(photoBuffer, (err, ipfsHash) => {
  //   console.log('ipfs.add', err, ipfsHash)
  // })
  }

  getImage(evt) {

    // console.log('getImage', this)
    // const ipfsInstance = this.ipfs.ipfsInstance
    // console.log('ipfsinstance is', ipfsInstance)
    // const {hash} = ipfsInstance[0]
    console.log("'the hash to be used is ", hash)
    const hash = "QmcD8XJcikRvHjJXuMuUNLZ52fnRUP6SzqMbsSDAZXG7w1"
    ipfs.cat(hash, function(err, file) {
      if (err) {
        throw err
      }

      // converting the received data into an "image"
      var bytes = new Uint8Array(file);

      var image = document.getElementById('ItemPreview'); // IdOfImage is the id attribute of the img tag in your html page
      image.src = "data:image/png;base64," + encode(bytes);

    })
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
      <div className="row" hidden={false}> 
      <input
      key="button"
      className="btn btn-default"
      type="file"
      name="Add file to IPFS"
      onChange={(evt) => this.uploadPicture(evt)}
      />
      <div> 
      <img id="ItemPreview" src="" />
      <button
      className="btn btn-default"
      onClick={(evt) => {
        this.getImage()
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