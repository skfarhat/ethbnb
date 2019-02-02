import React, { Component } from 'react'
import IPFSImage from '../IPFSImage'

class ListingMini extends Component {
  render() {
    const { title, price, location, country } = this.props
    return (
      <div className="listing-mini">
        {title}
        {location}
        {country}
        {price}
        {/* <IPFSImage hash={l.mainImageHash} ext={l.mainImageExtension} /> */}
      </div>
    )
  }
}

export default ListingMini
