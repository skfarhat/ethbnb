import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import IPFSImage from '../IPFSImage'

class ListingMini extends Component {
  render() {
    const { lid, title, location, country, price, hash, ext } = this.props
    return (
      <div className="listing-mini">
        <IPFSImage hash={hash} ext={ext} />
        <Link to={`/listing/${lid}`}>
          <h5>
            {title}
          </h5>
        </Link>
        <div>
          <em> Location: </em>
          <span className="location">
            {location}
          </span>
        </div>
        <div>
          <em> Country: </em>
          <span className="country">
            {country}
          </span>
        </div>
        <div>
          <em> Price: </em>
          <span className="price">
            {price}
          </span>
        </div>
      </div>
    )
  }
}

export default ListingMini
