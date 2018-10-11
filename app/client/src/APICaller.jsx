import React, { Component } from 'react';

class APICommand extends Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonEnabled: true
    }
  }

  generateInputFields() {
    let inputs = this.props.inputs

    // Parse the inputs of this function and create a list of DOM elements
    let inputsDom = []
    // Set this to true if the function input parameter is unsupported and we don't want to include that function
    // as an API button.
    let unsupportedInput = false
    for (var j = 0; j < inputs.length; j++) {
      var input = inputs[j]
      if (input.type !== "uint256" && input.type !== "string") {
        console.log("Skipping input.type", input.type, ". Still unsupported.");
        unsupportedInput = true
        break
      }
      inputsDom.push(
        <div key={input.name}>
            <input type="text" name={input.name} placeholder={input.name}/>
          </div>
      )
    }
    this.inputsDom = React.createElement(
      'div',
      {},
      inputsDom)
    this.buttonDisabled = unsupportedInput

    return inputsDom
  }

  render() {
    return (
      <div className="apiCommand">
        <button
      key="button"
      className="btn btn-default"
      type="button"
      disabled={this.buttonDisabled}
      onClick={(evt) => this.props.handleButtonClick(evt, this.props.name, this.props.parent)}>
        {this.props.name}
        </button>
        {this.generateInputFields()}
      </div>
      );
  }
}

class APICaller extends Component {
  constructor(props) {
    super(props)
    this.state = {
      error: null,
      errorInfo: null,
      selectedClient: 0,
    }
  }
  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  // You can also log error messages to an error reporting service here
  }

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
    this.setState({
      selectedClient: evt.target.value
    })
  }

  // Called when an APICommand button is clicked
  // here parent is meant to refer to 'this' which is not available in handleAPIButtonClick
  // because it's called as a callback function
  async handleAPIButtonClick(evt, name, parent) {
    console.log("handleAPIButtonClick")
    console.log(evt, name)
    if (name === "createAccount") {
      await parent.createAccount(parent)
      // TODO: implement handling here
    } else if (name === "hasAccount") {

    } else {
      console.log("Unimplemented function.")
    }
  }

  // Called when the input field for account name changes.
  updateAccountNameInput(evt) {
    this.setState({
      accountNameIn: evt.target.value
    })
  }

  // Called in render to generate a selector for clients
  generateClientSelector() {
    var optionElements = []
    for (var i = 0; i < this.props.eth.num_clients; i++) {
      optionElements.push(
        <option key={i} value={i}>{i}</option>)
    }
    let selectElem = React.createElement(
      "select",
      {
        key: "client-selector",
        onChange: (evt) => this.clientSelectChanged(evt)
      }, // props
      [optionElements] // children
    )
    return selectElem
  }
  parseABIForFunctions() {
    console.log("parseABIForFunctions", this.props)
    // If there's no ABI to work with abort.
    if (!('eth' in this.props) || !('abiArray' in this.props.eth))
      return []

    // We will return this after populating
    let ret = []

    var abi = this.props.eth.abiArray.abi
    for (var i = 0; i < abi.length; i++) {
      var o = abi[i]
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
    let abiCommands = this.parseABIForFunctions()
    let selectorUI = this.generateClientSelector()
    let content = React.createElement(
      'div',
      {},
      [h2UI, selectorUI, abiCommands]
      )

    // Error path
    if (this.state.errorInfo) {
      return (<h2>Something went wrong.</h2>);
    }
    return (content)
  }
}

export default APICaller
