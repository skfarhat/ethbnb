import React, { Component } from 'react';
import { connect } from "react-redux";
import { selectClient } from "../actions/"
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
  }
}

class ConnectedAPICaller extends Component {

  // Called when the select (dropdown) changes.
  clientSelectChanged(evt) {
    const val = parseInt(evt.target.value)
    this.props.selectClient(val)
  }

  async myHandleButtonClick(evt, name, inputs, client, eth) {
    console.log("myHandleButtonClick", eth, name, inputs, client, eth)
    evt.preventDefault()
    inputs = inputs.map(in1 => in1.value)

    // Find first function that matches name
    let foundFunction = null
    for (var i = 0; i < eth.abi.length; i++) {
      var o = eth.abi[i]
      if (o.type === "function" && o.name === name) {
        foundFunction = o
        break
      }
    }

    if (!foundFunction) {
      console.log("Could not find", name, " in ", eth.abi)
    } else {
      const ethFunction = eth.contractInstance[name]
      const lastParam = {
        from: client.address,
        gas: 100000
      }
      // TODO: unpack the param 'inputs' into the ethFunction here.
      console.log(ethFunction)
      var result = await ethFunction.sendTransaction(...inputs, lastParam)
      console.log("result of calling", name, "is ", result)
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
    console.log("parseABIForFunctions", this.props)

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
        name={o.name} // the name of the function
        inputs={o.inputs} // the inputs to the function
        handleButtonClick={ (evt, name, inputs) => this.myHandleButtonClick(evt, name, inputs, this.props.clients[this.props.selectedClient], this.props.eth)}
        parent={this}
        />]
      ))
    }
    return ret
  }

  render() {
    console.log("APICaller: render")
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

const APICaller = connect(mapStateToProps, mapDispatchToProps)(ConnectedAPICaller)
export default APICaller
