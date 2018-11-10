import log from '../../logger'
import React, { Component } from 'react'
import Listings from './Listings'
import Account from './Account'
import EthAccount from './EthAccount'

class Client extends Component {
  render() {
    log.debug("Client:: render()", this.props)
    const {address, listings, gasUsed} = this.props.client
    const ethAccountData = {
      gasUsed: gasUsed,
      address: address
    }
    // If the props.selected is true, then we add the class 'client-selected' to header
    const selectedClassName = this.props.isSelected ? "client-selected" : ""
    return (
      <div className={"col client-div " + selectedClassName}>
        <h5 onClick={(evt) => this.props.selectMeCallback(evt, address)}> Client {this.props.clientId} </h5>
        <EthAccount data={ethAccountData} />
        <Account data={this.props.client.account} />
        <Listings data={Object.values(listings)} />
    </div>
    )
  }
}

export default Client
