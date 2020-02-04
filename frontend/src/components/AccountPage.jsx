import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { isSet, formatDate } from '../constants/global'
import BookingEvent from './BookingEvent'
import ListingMini from './ListingMini'
import AccountDropdown from './AccountDropdown'
import { getAddr } from '../redux/accountActions'
// import { fetchEthEvents } from '../redux/actions'
// import EthEvent from './EthEvent'


class AccountPage extends Component {
  getMyRating() {
    const { accountInfo } = this.props
    const { nRatings, totalScore } = accountInfo
    if (nRatings) {
      const avgScore = (totalScore / nRatings)
      const reviewStr = (nRatings > 1) ? 'reviews' : 'review'
      return `Average rating: ${avgScore} (${nRatings} ${reviewStr})`
    }
    return 'No ratings'
  }

  render() {
    const { addr, account, accountInfo } = this.props
    if (!isSet(account) || !isSet(addr)) {
      return (<div> No account available </div>)
    }

    let accountInfoDOM = ''

    if (isSet(accountInfo)) {
      // My Bookings
      const bookingEvents = accountInfo.bookings.map((booking, idx) => <BookingEvent key={idx} userAddr={addr} {...booking} />)
      const bookingsDOM = (bookingEvents.length) ? (<div> <h3> Bookings </h3> {bookingEvents} </div>) : (<span />)
      const listings = accountInfo.listings.map((listing, idx) => <ListingMini key={idx} {...listing} />)
      const listingsDOM = (listings.length) ? (<div> <h3> My Listings </h3> {listings} </div>) : (<span />)
      accountInfoDOM = (
        <div className="account-info">
          <p> Date Created {formatDate(accountInfo.dateCreated)} </p>
          <p> Ethereum Address: {accountInfo.addr} </p>
          <p> { this.getMyRating() } </p>
          <div key="account-bookings" className="account-bookings">
            {bookingsDOM}
          </div>
          <div key="account-listings" className="account-listings">
            {listingsDOM}
          </div>
        </div>
      )
    }

    // Displays the name of the account if accountInfo is set
    // or just the eth address if accountInfo is null.
    const displayName = (isSet(accountInfo)) ? accountInfo.name : addr.substr(0, 5)

    return (
      <div className="accounts-page">
        <div>
          <h5 style={{ display: 'inline', marginRight: '50px' }}>
            {displayName}
          </h5>
          <AccountDropdown />
        </div>
        {accountInfoDOM}
      </div>
    )
  }
}

AccountPage.defaultProps = {
  account: null,
  accountInfo: null,
  contract: null,
  events: [],
}

AccountPage.propTypes = {
  account: PropTypes.object,
  accountInfo: PropTypes.object,
  contract: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  events: PropTypes.array,
}

const mapStateToProps = state => ({
  addr: getAddr(state),
  account: state.account,
  accountInfo: state.accountInfo,
  contract: state.contract,
  events: state.ethEvents,
})

export default connect(mapStateToProps)(AccountPage)
