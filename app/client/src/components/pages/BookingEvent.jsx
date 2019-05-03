import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Rating from 'react-rating'
import PropTypes from 'prop-types'
import moment from 'moment'
import { rateBooking } from '../../redux/actions'


const getReactRating = (val, readonly) => <Rating start={0} stop={5} readonly={readonly} initialRating={val} />

class BookingEvent extends Component {
  constructor(props) {
    super(props)
    this.onRatingChange = this.onRatingChange.bind(this)
  }

  onRatingChange(rating) {
    const { dispatch, contract, userAddr } = this.props
    // const { lid, bid } = returnValues
    // dispatch(rateBooking(lid, bid, rating, contract, ethAddr))
    // TODO: set it to readonly after setting or if it was already set (need to do that)
  }


  getRatingDOM() {
    const { ownerRating, guestRating, listing, userAddr } = this.props
    const userIsOwner = userAddr === listing.owner
    // User has not rated if they are the owner and guestRating is not defined (or not-zero)
    // Or, if they are not the owner (they are the guest) and ownerRating is not defined (or not-zero)
    const userHasNotRated = (userIsOwner && guestRating) || (!userIsOwner && ownerRating)
    let ourScore
    let theirScore
    if (userIsOwner) {
      ourScore = (ownerRating) ? (<div> They rated you {getReactRating(ownerRating, true)} </div>) : (<span> They have not rated you </span>)
      theirScore = (guestRating) ? getReactRating(guestRating, true) : getReactRating(3, false) // initial val of 3
    } else {
      ourScore = (guestRating) ? (<div> They rated you {getReactRating(guestRating, true)} </div>) : (<span> They have not rated you </span>)
      theirScore = (ownerRating) ? getReactRating(ownerRating, true) : getReactRating(3, false) // initial val of 3
    }
    return (
      <div className="ratings">
        <div key="their-score">
          Your rating of them {theirScore}
        </div>
        <div key="our-score">
          {ourScore}
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

BookingEvent.propTypes = {
  // from_date: PropTypes.date,
  // to_date: PropTypes.date,
  myAddr: PropTypes.string,
  contract: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  accounts: state.accounts,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(BookingEvent)
