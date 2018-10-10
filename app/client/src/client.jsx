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
    this.eth = props.ctxt
  }

  getClients() {
    console.log('ClientsManager: getClients()')
    let all_clients = [];
    for (var i = 0; i < this.eth.num_clients; i++) {
      if (this.eth.accounts) {
        all_clients.push(
          <Client
          key={i}
          clientId={i}
          clientAddress={this.eth.accounts[i]}
          />
        )
      }
    }
    return all_clients
  }

  render() {
    console.log('ClientsManager: render')
    return (
      <div id="div-clients">
        <h2> Clients </h2>
          { this.getClients() }
      </div>
    )
  }
}
export default ClientsManager