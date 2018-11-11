import React, { Component } from 'react';
import { connect } from "react-redux";
import log from "../logger"
import { selectClient, addMessage } from "../actions/"
import APICommand from "./APICommand"
import { NONE_ADDRESS } from "../constants/global.js"

const mapStateToProps = (state) => {
  return {
    eth: state.eth,
    clients: state.clients,
    abi: state.eth.abi,
    selectedClientAddr: state.selectedClientAddr
  }
}

const mapDispatchToProps = dispatch => {
  return {
    selectClient: (addr) => dispatch(selectClient(addr)),
    addMessage: (message) => dispatch(addMessage(message))
  }
}

class APICaller_ extends Component {

  constructor(props) {
    super(props)
    // Bind the callback function to allow it access to state and props
    this.myHandleButtonClick = this.myHandleButtonClick.bind(this)
  }

  // Called when the select (dropdown) changes.
  clientSelectChanged(evt) {
    this.props.selectClient(evt.target.value)
  }

  // Returns the first function in eth.abi that matches name, or null if not found. 
  findFunctionWithName(eth, name) {
    let foundFunction = null
    for (var i = 0; i < eth.abi.length; i++) {
      var o = eth.abi[i]
      if (o.type === "function" && o.name === name) {
        foundFunction = o
        break
      }
    }
    return foundFunction
  }

  // Returns a dictionary of input => value if all inputs have had their values set (not empty). 
  // it does not check whether the values they have been set to conform to the type of the input).
  // Returns null if any of the inputs has not been set. 
  validateAndMapCommandInputs(inputs) {
    const ret = inputs.map(in1 => in1.value)
    for (var k in ret) {
      if (!ret[k] || ret[k].length === 0)
        return null
    }
    return ret
  }

  async myHandleButtonClick(evt, apiCmd) {
    evt.preventDefault()

    const name = apiCmd.name
    const selectedClient = this.props.clients[this.props.selectedClientAddr] // used for the 'from' param when issuing transaction
    const eth = this.props.eth
    const inputs = this.validateAndMapCommandInputs(apiCmd.inputs)
    if (!inputs) {
      alert("Missing inputs for function '" + name + "'")
      return
    }

    // Find first function that matches name
    let foundFunction = this.findFunctionWithName(eth, name)

    if (!foundFunction) {
      log.debug("Could not find ", name, " in ", eth.abi)
    } else {
      const ethFunction = eth.contractInstance[name]
      const lastParam = {
        from: selectedClient.address,
        gas: 1000000
      }
      try {
        let message = null
        // Here we check whether the function to execute is a constant one. 
        // If so, we make a local 'call' and get the result immediately.
        // If the function is state-changing, we issue a transaction. The result will later be brought back to us via an event. 
        if (apiCmd.constant) {
          const result = await ethFunction.call(...inputs, lastParam)
          message = 'Local call ' + name + ' has been made. Result is: ' + result
        } else {
          const txHash = await ethFunction.sendTransaction(...inputs, lastParam)
          message = 'Transaction ' + name + ' ' + txHash.substr(0, 5) + ' has been submitted.'
          eth.web3.eth.getTransactionReceipt(txHash, (error, txObj) => {
            if (error) {
              this.props.addMessage({
                text: 'Got error in getTransactionReceipt' + error,
                data: error
              })
            } else {
              this.props.addMessage({
                text: 'Transaction ' + txObj.transactionHash.substr(0, 5) + ' used ' + txObj.gasUsed
              })
            }
          })
        }
        this.props.addMessage({
          text: message
        })
        log.debug(message)
      } catch (exc) {
        const message = "Failed to execute ethereum function " + name
        this.props.addMessage({
          text: message
        })
        log.error(message)
        log.error('Actual exception message: ', exc)
      }
    }
  }

  parseABIForFunctions() {
    // We will return this after populating
    let ret = []

    if (!this.props.abi)
      return ret

    for (var i = 0; i < this.props.abi.length; i++) {
      var o = this.props.abi[i]
      // Skip non-functions
      if (o.type !== "function")
        continue
      // TODO: replace the inputs here with EthButton which will need to take a handler for the function too.
      ret.push(React.createElement('div', {
        id: 'rightSideAPI',
        key: o.name,
      },
        [<APICommand
        key={o.name}
        abiFunction={o}
        isDisabled={this.props.selectedClientAddr === NONE_ADDRESS}
        handleButtonClick={(evt, self) => this.myHandleButtonClick(evt, self)}
        parent={this}
        />]
      ))
    }
    return ret
  }

  render() {
    log.debug("APICaller: render")
    return (
      <div> 
      <h2 key="title"> API </h2>
      <p> Selected client: {this.props.selectedClientAddr.substr(0, 7)} </p>
      {this.parseABIForFunctions()}
      </div>
    )
  }
}

const APICaller = connect(mapStateToProps, mapDispatchToProps)(APICaller_)
export default APICaller
