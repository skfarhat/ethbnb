import React, { Component } from 'react';

class Account extends Component {

  render(props) {
    let toAdd = []
    if (this.props.act !== null && this.props.act !== undefined) {
      toAdd.push(<h3 key="3"> Account information here </h3>)
    }
    return (
      <div>
      {toAdd}
      </div>
    )
  }
}

class Client extends Component {
  render() {
    const id = this.props.clientId
    const accountId = this.props.clientAddress
    const clientAccount = this.props.clientAccount

    return (
      <div className="col client-div" data-client-id="{id}">
        <h2> Client {id} </h2>
        <div>
          <em> Address </em>
          <span id="accountId"> {accountId} </span>
        </div>
        <Account act={clientAccount} />
    </div>
    )
  }
}

class ClientsManager extends Component {
  constructor(props) {
    super(props)
    this.eth = props.eth
  }

  render() {
    console.log("ClientsManager: render")
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

    return (
      <div id="div-clients">
        <h2> Clients </h2>
        { all_clients }
      </div>
    )
  }
}

export default ClientsManager
