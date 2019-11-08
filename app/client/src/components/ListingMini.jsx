import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import EthRating from './EthRating'
import IPFSImage from './IPFSImage'
import { isSet } from '../constants/global'
import { getObjFromCountryCode } from './common'

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
  const ratingStr = (nRatings > 1) ? 'ratings' : 'rating'
  return (
    <div className="listing-rating">
      <EthRating
        readonly
        initialRating={totalScore / nRatings}
        fractions={2}
      />
      <div>
        <em>
          {`${nRatings} ${ratingStr}`}
        </em>
      </div>
    </div>
  )
}

const getCountryElem = (code) => {
  const { flag, text } = getObjFromCountryCode(code)
  return (
    <span>
      {`${text} `}
      <i className={`${flag} flag`} />
    </span>
  )
}

class ListingMini extends Component {
  render() {
    const {
      lid, title, location,
      country, price, nRatings,
      totalScore, owner, ownerInfo,
      imageCID, imageCIDSource
    } = this.props

    // Init fields needed for Listing's image
    // NOTE:  only ipfs as a data source is supported and jpg as images are supported
    const hash = imageCIDSource === 'ipfs' ? imageCID : ''
    const ext = 'jpg'

    const ownerStr = isSet(ownerInfo) ? ownerInfo.name : owner
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
        {getRatingElem(totalScore, nRatings)}
        <div>
          <span className="location">
            {location}, {getCountryElem(country)}
          </span>
        </div>
        <div>
          <em> {ownerStr} </em>
        </div>
        <div>
          <span className="price">
            {price} ETH
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
  location: PropTypes.string.isRequired,
  owner: PropTypes.string.isRequired,
  ownerInfo: PropTypes.object,
  country: PropTypes.number.isRequired,
  price: PropTypes.number.isRequired,
  nRatings: PropTypes.number,
  totalScore: PropTypes.number,
}

export default ListingMini
