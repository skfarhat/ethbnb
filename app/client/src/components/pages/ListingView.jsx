import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'

const mapStateToProps = (state, ownProps) => ({
  listings: state.listingResults,
  lid: ownProps.lid,
})

const getListingDetails = (listings, lid) => {
  // If listings is undefined
  if (typeof listings === 'undefined') {
    return (<h4> There is no binding between react-router and react-redux yet </h4>)
  }
  // If listings is defined, find the listing with matching lid
  // if zero or more than one are found, return error
  const res = listings.filter(o => o.lid === lid)
  if (res.length !== 1) {
    return (
      <h4>
        {`Error looking for listing with lid ${lid}`}
      </h4>
    )
  }
  const l = res[0]
  return (
    <div>
      <h5>
        {l.title}
      </h5>
      <div>
        <em> Location: </em>
        <span className="location">
          {l.location}
        </span>
      </div>
      <div>
        <em> Country: </em>
        <span className="country">
          {l.country}
        </span>
      </div>
      <div>
        <em> Price: </em>
        <span className="price">
          {l.price}
        </span>
      </div>
    </div>
  )
// <IPFSImage hash={hash} ext={ext} />
}
class ListingView extends Component {
  render() {
    const { listings, match } = this.props
    const { lid } = match.params

    return (
      <div className="listing-view">
        <Link key="back-button" to="/listing/"> Back </Link>
        { getListingDetails(listings, lid) }
      </div>
    )
  }
}

ListingView.propTypes = {
  // TODO: listings propTypes here
}
export default connect(mapStateToProps, null)(ListingView)
