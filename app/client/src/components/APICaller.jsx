import React, { Component } from 'react';
import { connect } from "react-redux";
import log from "../logger"
import { selectClient, addMessage } from "../actions/"
import APICommand from "./APICommand.js"

const mapStateToProps = (state) => {
  return {
    eth: state.eth,
    clients: state.clients,
    abi: state.eth.abi,
    selectedClient: state.selectedClient
  }
}

const mapDispatchToProps = dispatch => {
  return {
    selectClient: (index) => dispatch(selectClient(index)),
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
    const val = parseInt(evt.target.value)
    this.props.selectClient(val)
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

  async myHandleButtonClick(evt, apiCmd) {
    evt.preventDefault()

    const name = apiCmd.name
    const selectedClient = this.props.clients[this.props.selectedClient] // used for the 'from' param when issuing transaction
    const eth = this.props.eth
    const inputs = apiCmd.inputs.map(in1 => in1.value)

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
        await ethFunction.sendTransaction(...inputs, lastParam)
        const message = 'Transaction ' + name + ' has been submitted.'
        this.props.addMessage({text: message})
        log.debug(message)
      }
      catch(exc) {
        const message = "Failed to ethereum function " + name
        this.props.addMessage({text: message})
        log.error(message)
      }
    }
  }

  // Called in render to generate a selector for clients
  generateClientSelector() {
    var optionElements = []
    for (var i = 0; i < this.props.clients.length; i++) {
      optionElements.push(
        <option key={i} value={i}>{i}</option>)
    }
    let selectElem = React.createElement(
      "select",
      {
        key: "client-selector",
        onChange: (evt) => this.clientSelectChanged(evt)
      },
      [optionElements]
    )
    return selectElem
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
        handleButtonClick={(evt, self)=>this.myHandleButtonClick(evt, self)}
        parent={this}
        />]
      ))
    }
    return ret
  }

  render() {
    log.debug("APICaller: render")
    let h2UI = <h2 key="title"> API </h2>
    let selectorUI = this.generateClientSelector()
    let abiCommands = this.parseABIForFunctions()
    let content = React.createElement(
      'div',
      {},
      [h2UI, selectorUI, abiCommands]
    )
    return (content)
  }
}

const APICaller = connect(mapStateToProps, mapDispatchToProps)(APICaller_)
export default APICaller
