import React, { Component } from "react"
import { connect } from "react-redux"
import Client from "./Client.jsx"

// // Setup event listener for CreateAccountEv
// var ContractInstance = this.state.contractInstance
// var createAccountEv = ContractInstance.EvCreateAccount()

// var createAccountEvHandler = function(error, result) {
//   console.log("createAccountEvHandler")
//   console.log(error)
//   console.log(result)
//   for (var i = 0; i < result.length; i++) {
//     var ev = result[i]
//     const {from, name, dateCreated} = ev.args
//     var client = self.getClientObjFromAddress(from)
//     if (!client) {
//       console.log("BUG: something wrong here??")
//       continue
//     }
//     client.account = {
//       name: name,
//       dateCreated: dateCreated,
//     }
//   }
//   self.setState(self.state)
//   console.log("SetState")
// }

// // Get all future events
// createAccountEv.watch(createAccountEvHandler)

// // Get all past events
// ContractInstance.EvCreateAccount({}, {
//   fromBlock: 0,
//   toBlock: 'latest'
// }).get(createAccountEvHandler);

// var toSet = {
//   clients: clients,
//   num_clients: this.NUM_CLIENTS
// }
// // Change state after all eth is setup to re-render child components
// this.setState(toSet)
// console.log("setState called again..", toSet)

const mapStateToProps = state => {
  return {
    selectedClient: state.selectedClient,
    eth: state.eth,
    clients: state.clients
  }
}

class ConnectedClientsManager extends Component {
  constructor(props) {
    super(props)

    // Is set to true after the first time we register event watchers
    // to alert us of changes.
    this.hasRegisteredEventWatchers = false
  }

  render() {
    console.log("ClientsManager:: render", this.props)

    let all_clients = this.props.clients.map((client, index) =>
    <Client
        key={index}
        clientId={index}
        selected={this.props.selectedClient === index}
        clientAddress={client.address}
        clientAccount={client.account}
        clientListings={client.listings}
        />
    )

    if (!this.hasRegisteredEventWatchers && this.props.eth) {
      // Register watchers

    }

    return (
      <div id="div-clients">
        <h2> Clients </h2>
        { all_clients }
      </div>
    )
  }
}

const ClientsManager = connect(mapStateToProps)(ConnectedClientsManager)
export default ClientsManager
