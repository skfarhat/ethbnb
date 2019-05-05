import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Rating from 'react-rating'
import PropTypes from 'prop-types'
import moment from 'moment'
import { contractCall, hasPendingTx } from '../../redux/actions'


class BookingEvent extends Component {
  constructor(props) {
    super(props)
    this.onRatingChange = this.onRatingChange.bind(this)
  }

  onRatingChange(rating) {
    const { dispatch, userAddr, lid, bid } = this.props
    dispatch(contractCall('rate', [lid, bid, rating], userAddr, { eventName: 'RatingComplete' }))
    // TODO: show something on the UI suggesting we have submitted
    // TODO: set it to readonly after setting or if it was already set (need to do that)
  }

  getReactRating(val, readonly) {
    return (
      <Rating
        start={0}
        stop={5}
        readonly={readonly}
        initialRating={val}
        onChange={this.onRatingChange}
      />
    )
  }

  getRatingDOM() {
    const { ownerRating, guestRating, listing, userAddr, pendingTx, lid, bid } = this.props
    const userIsOwner = userAddr === listing.owner
    const isRatingTxPending = hasPendingTx(pendingTx, 'rate', [lid, bid], userAddr)
    console.log('isRatingTxPending', isRatingTxPending)
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
          { this.getReactRating((guestRating || 3), isRatingTxPending || !!guestRating) }
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
          { this.getReactRating(ownerRating || 3, isRatingTxPending || !!ownerRating) }
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
    const { location, title, price, from_date, to_date, listing } = this.props
    const fromDate1 = moment(from_date.toString()).format('DD/MM/YY')
    const toDate1 = moment(to_date.toString()).format('DD/MM/YY')
    this.getRatingDOM()
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
        {this.getRatingDOM()}
      </div>
    )
  }
}

BookingEvent.defaultProps = {
  guestRating: 0,
  ownerRating: 0,
}

BookingEvent.propTypes = {
  // from_date: PropTypes.date,
  // to_date: PropTypes.date,
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
