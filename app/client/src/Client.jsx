import React, { Component } from 'react';

class Account extends Component {

  bigNumberToDate(bigNumber) {
    console.log(bigNumber.toString())
    return new Date(parseInt(bigNumber.toString()) * 1000).toString()
  }

  render(props) {
    if (this.props.act !== null && this.props.act !== undefined) {
      return (
        <div>
          <table border="1">
          <tbody>
          <tr>
          <td colspan="2"> <b> Account </b> </td>
          </tr>
            <tr>
              <td> Name </td>
              <td> {this.props.act.name} </td>
            </tr>
            <tr>
              <td> Date Created </td>
              <td> {this.bigNumberToDate(this.props.act.dateCreated)} </td>
            </tr>
          </tbody>
          </table>
        </div>
      )
    } else {
      return (<div> jk</div>)
    }
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
