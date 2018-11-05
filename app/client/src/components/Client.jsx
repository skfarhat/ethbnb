import log from "../logger"
import React, { Component } from 'react';

class Listing extends Component {
  render() {
    log.debug("Listing", this.props.listingId)
    return (
      <tr key={this.props.listing.id.toString()}>
      <td>{this.props.listing.id}</td>
      <td>{this.props.listing.shortName}</td>
      <td>{this.props.listing.price}</td>
      <td>{this.props.listing.location}</td>
      </tr>
    )
  }
}

class Listings extends Component {
  render() {
    log.debug("Listings::render()", this.props.listings)
    if (this.props.listings === null || this.props.listings === undefined || this.props.listings.length === 0)
      return (<div> <em> No listings. </em> </div>)
    let listings = []
    for (var i in this.props.listings) {
      const listing = this.props.listings[i]
      listings.push(<Listing key={listing.id} listing={listing} />)
    }
    return (
      <table border="1">
      <tbody>
        <tr><td colSpan="4"><b>Listings</b></td></tr>
        <tr><td>id</td><td>Name</td><td>Price</td><td>Location</td></tr>
        {listings}
      </tbody>
      </table>
    )
  }
}

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
    const id = this.props.clientId
    const {addr, account, listings} = this.props.client

    // If the props.selected is true, then we add the class 'client-selected' to header
    const selectedClassName = this.props.selected ? "client-selected" : ""
    return (
      <div className="col client-div" data-client-id="{id}">
        <h2 className={selectedClassName}> Client {id} </h2>
        <div key='address'>
          <em> Address </em>
          <span id="accountId"> {addr} </span>
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
