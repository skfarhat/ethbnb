import React, { Component } from 'react';

function Client(props) {
  const id = props.clientId
  const accountId = props.clientAddress
  return (
    <div className="col client-div" data-client-id="{id}">
      <h2> Client {id} </h2>
      <div>
        <em> Account ID </em>
        <span id="accountId"> {accountId} </span>
      </div>
    </div>
  )
}

class ClientsManager extends Component {
  constructor(props) {
    super(props)
    this.eth = props.eth
  }

  getClients() {
    let all_clients = [];
    for (var i = 0; i < this.props.clients.length; i++) {
      all_clients.push(
        <Client
        key={i}
        clientId={i}
        clientAddress={this.props.clients[i].address}
        clientAccount={this.props.clients[i].account}
        clientListings={this.props.clients[i].listings}
        />
      )
    }
    return all_clients
  }

  render() {
    return (
      <div id="div-clients">
        <h2> Clients </h2>
        { this.getClients() }
      </div>
    )
  }
}

export default ClientsManager
