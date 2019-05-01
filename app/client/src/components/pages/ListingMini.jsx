import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Rating from 'react-rating'
import PropTypes from 'prop-types'
import IPFSImage from '../IPFSImage'

// Returns the appropriate DOM element
// given totalScore and nRatings
const getRatingElem = (totalScore, nRatings) => {
  if (nRatings === 0) {
    return (
      <div className="listing-rating">
        <em> No ratings </em>
      </div>
    )
  }
  return (
    <div className="listing-rating">
      <Rating
        readonly
        initialRating={totalScore / nRatings}
        fractions={2}
      />
    </div>
  )
}

class ListingMini extends Component {
  render() {
    const { lid, title, location, country, price, hash, ext, nRatings, totalScore } = this.props
    return (
      <div className="listing-mini">
        <Link to={`/listing/${lid}`}>
          <IPFSImage
            hash={hash}
            ext={ext}
          />
          {getRatingElem(totalScore, nRatings)}
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
ListingMini.defaultProps = {
  nRatings: 0,
  totalScore: 0,
}

ListingMini.propTypes = {
  lid: PropTypes.number.isRequired,
  title: PropTypes.string,
  country: PropTypes.number.isRequired,
  price: PropTypes.number.isRequired,
  hash: PropTypes.string.isRequired,
  ext: PropTypes.string.isRequired,
  nRatings: PropTypes.number,
  totalScore: PropTypes.number,
}

export default ListingMini
