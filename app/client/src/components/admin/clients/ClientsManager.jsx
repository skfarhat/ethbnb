import React, { Component } from 'react'
import { connect } from 'react-redux'
import { selectClient } from '../../../actions'
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

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedClientsManager)
