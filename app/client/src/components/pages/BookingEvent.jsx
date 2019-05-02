import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import Rating from 'react-rating'
import PropTypes from 'prop-types'
import moment from 'moment'
import { rateBooking } from '../../redux/actions'


class BookingEvent extends Component {
  constructor(props) {
    super(props)
    this.onRatingChange = this.onRatingChange.bind(this)
  }

  onRatingChange(rating) {
    const { dispatch, contract, ethAddr } = this.props
    // const { lid, bid } = returnValues
    // dispatch(rateBooking(lid, bid, rating, contract, ethAddr))
    // TODO: set it to readonly after setting or if it was already set (need to do that)
  }

  render() {
    const { location, title, price, from_date, to_date, listing } = this.props
    const fromDate1 = moment(from_date.toString()).format('DD/MM/YY')
    const toDate1 = moment(to_date.toString()).format('DD/MM/YY')
    return (
      <div className="booking-event">
        <h5>
          {`${listing.location} ${fromDate1}  ${toDate1}`}
        </h5>
        <Link to={`/listing/${listing.lid}`}>
          {listing.title}
        </Link>
        {listing.owner}
        <Rating
          start={0}
          stop={5}
          onChange={this.onRatingChange}
        />
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
