import React, { Component } from 'react';
import { connect } from "react-redux";
import { selectClient } from "../actions/"
import APICommand from "./APICommand.js"

const mapStateToProps = (state) => {
  return {
    eth: state.eth,
    clients: state.clients,
    abi: state.eth.abi
  }
}

const mapDispatchToProps = dispatch => {
  return {
    selectClient: (index) => dispatch(selectClient(index)),
  }
}

class ConnectedAPICaller extends Component {

  async hasAccount(self) {
    console.log("hasAccount", self)
    var state = self.state
    var eth = self.props.eth
    var clientId = parseInt(state.selectedClient)
    var account = eth.web3.eth.accounts[clientId]
    var res = await eth.contractInstance.hasAccount({
      from: account,
      gas: 100000
    })
    console.log("Client ", clientId, " has account:", res)
  }

  async createAccount() {
    var self = this
    console.log("createAccount", self)
    var state = self.state
    var eth = self.props.eth
    var clientId = parseInt(state.selectedClient)
    var inputName = state.accountNameIn
    var account = eth.web3.eth.accounts[clientId]
    var res = await eth.contractInstance.createAccount(inputName, {
      from: account,
      gas: 100000
    })
    console.log("CreateAccount result", res)
  }

  // Called when the select (dropdown) changes.
  clientSelectChanged(evt) {
    const val = parseInt(evt.target.value)
    this.props.selectClient(val)
  }

  // Called when an APICommand button is clicked
  // here parent is meant to refer to 'this' which is not available in handleAPIButtonClick
  // because it's called as a callback function
  // async handleAPIButtonClick(evt, name, parent) {
  //   console.log("handleAPIButtonClick")
  //   console.log(evt, name)
  //   if (name === "createAccount") {
  //     await parent.createAccount(parent)
  //     // TODO: implement handling here
  //   } else if (name === "hasAccount") {

  //   } else {
  //     console.log("Unimplemented function.")
  //   }
  // }

  // Called when the input field for account name changes.
  // updateAccountNameInput(evt) {
  //   this.setState({
  //     accountNameIn: evt.target.value
  //   })
  // }

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

    if ( ! this.props.abi )
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
        name={o.name}
        inputs={o.inputs}
        handleButtonClick={this.handleAPIButtonClick}
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

    // Error path
    // if (this.state.errorInfo) {
      // return (<h2>Something went wrong.</h2>);
    // }
    return (content)
  }
}

const APICaller = connect(mapStateToProps, mapDispatchToProps)(ConnectedAPICaller)
export default APICaller
