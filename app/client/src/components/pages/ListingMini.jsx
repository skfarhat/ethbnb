import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import IPFSImage from '../IPFSImage'

class ListingMini extends Component {
  render() {
    const { lid, title, location, country, price, hash, ext } = this.props
    return (
      <div className="listing-mini">
        <Link to={`/listing/${lid}`}>
          <IPFSImage
            hash={hash}
            ext={ext}
          />
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

ListingMini.propTypes = {
  lid: PropTypes.string.isRequired,
  title: PropTypes.string,
  country: PropTypes.number.isRequired,
  price: PropTypes.number.isRequired,
  hash: PropTypes.string.isRequired,
  ext: PropTypes.string.isRequired,
}

export default ListingMini
