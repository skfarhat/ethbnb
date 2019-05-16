import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import EthRating from './EthRating'
import PropTypes from 'prop-types'
import { contractCall } from '../../redux/actions'
import { isSet, formatDate } from '../../constants/global'

const STARS_INITIAL_VAL = 3

// BookingEvent
// ------------
//
// For the initialValue of <EthRating /> this component checks
// the below in order:
//
// (1) ownerRating / guestRating if provided by the server
// (2) a pendingTx that has 'returnVal' set
// If neither (1) nor (2) then an STARS_INITIAL_VAL is used
class BookingEvent extends Component {
  constructor(props) {
    super(props)
    this.onRatingChange = this.onRatingChange.bind(this)
    this.getStorageKey = (lid, bid, userAddr) => `${userAddr} rate(${lid},${bid})`
  }

  onRatingChange(rating) {
    if (isSet(rating)) {
      const { dispatch, userAddr, lid, bid } = this.props
      const other = {
        eventName: 'RatingComplete',
        storageKey: this.getStorageKey(lid, bid, userAddr),
        returnVal: rating,
      }
      dispatch(contractCall('rate', [lid, bid, rating], userAddr, other))
      // TODO: show something on the UI suggesting we have submitted
    }
  }

  getReactRating(val, readonly) {
    return (
      <EthRating
        readonly={readonly}
        initialRating={val}
        onChange={this.onRatingChange}
      />
    )
  }

  // Returns the stars set in pendingTx if there
  // exists a pendingTx amtching this.getStorageKey()
  // and if returnVal was set in that pendingTx
  // Otherwise returns 0
  getPendingStarsIfExist() {
    const { pendingTx, lid, bid, userAddr } = this.props
    const txObjStr = pendingTx[this.getStorageKey(lid, bid, userAddr)]
    if (isSet(txObjStr)) {
      const txObj = JSON.parse(txObjStr)
      if (isSet(txObj.returnVal)) {
        return txObj.returnVal
      }
    }
    return 0
  }

  getRatingDOM() {
    const { ownerRating, guestRating, listing, userAddr } = this.props
    const userIsOwner = userAddr === listing.owner

    // Extract the number of stars from the transaction object
    // stored in pendingTx
    const pendingStars = this.getPendingStarsIfExist()

    // User has not rated if they are the owner and guestRating
    // is not defined (or not-zero)
    // Or, if they are not the owner (they are the guest) and
    // ownerRating is not defined (or not-zero)
    let yourScore
    let theirScore
    if (userIsOwner) {
      yourScore = (
        <div>
          { (ownerRating !== 0) ? this.getReactRating(ownerRating, true) : (<span />) }
        </div>
      )
      theirScore = (
        <div>
          { this.getReactRating(guestRating || pendingStars || STARS_INITIAL_VAL,
            !!pendingStars || !!guestRating) }
        </div>
      )
    } else {
      yourScore = (
        <div>
          { (guestRating !== 0) ? this.getReactRating(guestRating, true) : (<span />) }
        </div>
      )
      theirScore = (
        <div>
          { this.getReactRating(ownerRating || pendingStars || STARS_INITIAL_VAL,
            !!pendingStars || !!ownerRating) }
        </div>
      )
    }
    return (
      <div className="ratings">
        <div key="their-score">
          Their score: {theirScore}
        </div>
        <div key="your-score">
          Your score: {yourScore}
        </div>
      </div>
    )
  }

  render() {
    const { fromDate, toDate, listing } = this.props
    const fromDate1 = formatDate(fromDate)
    const toDate1 = formatDate(toDate)
    return (
      <div className="booking-event">
        <h5>
          {`${listing.location} ${fromDate1}  ${toDate1}`}
        </h5>
        Listing name:
        <Link to={`/listing/${listing.lid}`}>
          {listing.title}
        </Link>
        <div>
          {listing.owner}
        </div>
        { this.getRatingDOM() }
      </div>
    )
  }
}

BookingEvent.defaultProps = {
  guestRating: 0,
  ownerRating: 0,
}

BookingEvent.propTypes = {
  // fromDate: PropTypes.date,
  // toDate: PropTypes.date,
  bid: PropTypes.number.isRequired,
  dispatch: PropTypes.func.isRequired,
  guestRating: PropTypes.number,
  lid: PropTypes.number.isRequired,
  listing: PropTypes.object,
  ownerRating: PropTypes.number,
  pendingTx: PropTypes.object,
  userAddr: PropTypes.string.isRequired,
}

const mapStateToProps = state => ({
  accounts: state.accounts,
  pendingTx: state.pendingTx,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(BookingEvent)
