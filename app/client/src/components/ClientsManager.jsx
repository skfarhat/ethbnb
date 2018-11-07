import React, { Component } from "react"
import { connect } from "react-redux"
import log from "../logger"
import Client from "./Client.jsx"

const mapStateToProps = state => {
  return {
    selectedClient: state.selectedClient,
    eth: state.eth,
    clients: state.clients
  }
}

class ConnectedClientsManager extends Component {
  render() {
    log.debug("ClientsManager:: render", this.props)
    let all_clients = this.props.clients.map((client, index) =>
    <Client
        key={index}
        clientId={index}
        selected={this.props.selectedClient === index}
        client={client}
        />
    )
    return (
      <div id="clients-div">
        <h2> Clients </h2>
        { all_clients }
      </div>
    )
  }
}

const ClientsManager = connect(mapStateToProps)(ConnectedClientsManager)
export default ClientsManager
