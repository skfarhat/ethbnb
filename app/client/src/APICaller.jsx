import React, { Component } from 'react';

class APICommand extends Component {
  render() {
    return (
      <div className="apiCommand">
        <button key="button" className="btn btn-default" type="button"> {this.props.name} </button>
          {this.props.inputsDom}
      </div>
      );
  }
}

class EthButton extends Component {
  render() {
    var props = this.props
    return (
      <button onClick={() => props.handleClick(props.parent)}> {props.name} </button>
    )
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
  async createAccount(self) {
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
  // Called when the input field for account name changes.
  updateAccountNameInput(evt) {
    this.setState({
      accountNameIn: evt.target.value
    })
  }

  parseABIForFunctions() {
    console.log("parseABIForFunctions", this.props)

    // If there's no ABI to work with abort.
    if (!('eth' in this.props) || !('abiArray' in this.props.eth))
      return []

    console.log(this.props)

    // We will return this after populating
    let ret = [<h2 key="title"> API </h2>]

    // For each function in the ABI
    var abi = this.props.eth.abiArray.abi
    for (var i = 0; i < abi.length; i++) {
      var o = abi[i]

      // Skip non-functions
      if (o.type !== "function")
        continue

      // Parse the inputs of this function and create a list of DOM elements
      let inputsDom = []
      // Set this to true if the function input parameter is unsupported and we don't want to include that function
      // as an API button.
      let unsupportedInput = false
      for (var j = 0; j < o.inputs.length; j++) {
        var input = o.inputs[j]
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

      // This function has some input parameters that we don't know how to handle (or render in the DOM),
      // so we'll skip adding
      if (unsupportedInput)
        continue

      // TODO: replace the inputs here with EthButton which will need to take a handler for the function too.
      ret.push(React.createElement('div',
        {
          id: 'rightSideAPI',
          key: o.name,
        },
        [<APICommand key={o.name} name={o.name} inputsDom={inputsDom}/>]
        ))
    }

    return ret
  }

  // TODO: to remove
  getContent() {
    var optionElements = []
    for (var i = 0; i < this.props.eth.num_clients; i++) {
      optionElements.push(
        <option key={i} value={i}>{i}</option>)
    }

    var selectElem = React.createElement(
      "select",
      {
        key: "client-selector",
        onChange: (evt) => this.clientSelectChanged(evt)
      }, // props
      [optionElements] // children
    )
    var h2 = React.createElement('h2', {}, ["API"])
    var rest = (
    <div key="command-buttons">
                      <div>
                          <EthButton name="Has Account" handleClick={this.hasAccount} parent={this}/>
                          <EthButton name="Create Account" handleClick={this.createAccount} parent={this}/>
                          <input type="text" name="account-name" placeholder="name" onChange={evt => this.updateAccountNameInput(evt)} />
                      </div>
                      <div>
                          <button> Create Listing </button>
                      </div>
                  </div>
    )
    var div = React.createElement('div', {}, [h2, selectElem, rest])
    return div
  }
  render() {
    console.log("APICaller: render")
    let content = this.parseABIForFunctions()

    // Error path
    if (this.state.errorInfo) {
      return (<h2>Something went wrong.</h2>);
    }
    return (content)
  }
}

export default APICaller
