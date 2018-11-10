import log from '../logger'
import React, { Component } from 'react'
import Listings from './Listings'

class Account extends Component {

  bigNumberToDate(bigNumber) {
    return new Date(parseInt(bigNumber.toString()) * 1000).toString()
  }

  render() {
    if (this.props.act !== null && this.props.act !== undefined) {
      return (
        <div>
          <table border="1">
          <tbody>
          <tr>
          <td colSpan="2"> <b> Account </b> </td>
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
      return (<div> <em> No account information. </em> </div>)
    }
  }
}

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
