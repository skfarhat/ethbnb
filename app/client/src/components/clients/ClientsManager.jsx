import React, { Component } from 'react'
import { connect } from 'react-redux'
import log from '../../logger'
import { selectClient } from '../../actions'
import Client from './Client'

const mapStateToProps = state => ({
  selectedClientAddr: state.selectedClientAddr,
  eth: state.eth,
  clients: state.clients,
})

const mapDispatchToProps = dispatch => ({ selectClient: addr => dispatch(selectClient(addr)) })

class ConnectedClientsManager extends Component {
  selectClient(evt, addr) {
    evt.preventDefault()
    this.props.selectClient(addr)
  }

  render() {
    log.debug('ClientsManager:: render', this.props)
    const allClients = []
    let i = 0
    for (const addr in this.props.clients) {
      const client = this.props.clients[addr]
      allClients.push(
        <Client
          key={addr}
          client={client}
          clientId={i++}
          isSelected={this.props.selectedClientAddr === addr}
          selectMeCallback={(evt, clientAddr) => this.selectClient(evt, clientAddr)}
        />,
      )
    }
    return (
      <div id="clients-div">
        <h2> Clients </h2>
        {allClients}
      </div>
    )
  }
}

const ClientsManager = connect(mapStateToProps, mapDispatchToProps)(ConnectedClientsManager)
export default ClientsManager
