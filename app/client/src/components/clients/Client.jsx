import log from '../../logger'
import React, { Component } from 'react'
import Listings from './Listings'
import Account from './Account'

class Client extends Component {
  render() {
    log.debug("Client:: render()", this.props)
    const {address, account, listings, gasUsed} = this.props.client

    // If the props.selected is true, then we add the class 'client-selected' to header
    const selectedClassName = this.props.isSelected ? "client-selected" : ""
    return (
      <div className={"col client-div " + selectedClassName} onClick={(evt) => this.props.selectMeCallback(evt, address)}>
        <div key='eth-general'>
          <div>
            <em> Address </em>
            <span id="accountId"> {address} </span>
          </div>
          <div>
            <em> Gas Used </em> 
            <span> {gasUsed} </span>
          </div>
        </div>
        <div key='account'>
          <Account act={account} />
        </div>
        <div key='listings'>
          <Listings listings={listings} />
        </div>
    </div>
    )
  }
}

export default Client
