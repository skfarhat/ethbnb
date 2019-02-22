import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Loader } from 'semantic-ui-react'
import { fetchListingsIfNeeded } from '../../actions'


const mapStateToProps = (state, ownProps) => ({
  listings: state.listings,
  isFetching: state.isFetching,
  lid: ownProps.lid,
})

const getListingDetails = (isFetching, listings, lid) => {
  console.log(listings)
  // If listings is undefined
  if (listings === null || typeof listings === 'undefined') {
    return (
      <Loader active={isFetching} />)
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
  componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchListingsIfNeeded())
  }

  render() {
    const { listings, match, isFetching } = this.props
    const { lid } = match.params
    return (
      <div className="listing-view">
        <Link key="back-button" to="/listing/"> Back </Link>
        { getListingDetails(isFetching, listings, lid) }
      </div>
    )
  }
}

ListingView.propTypes = {
  isFetching: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  listings: PropTypes.array.isRequired,
}
export default connect(mapStateToProps)(ListingView)
