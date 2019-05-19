import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Loader } from 'semantic-ui-react'
import { fetchEthEvents } from '../redux/actions'
import { fetchAccountInfo } from '../redux/accountActions'
import { isSet, formatDate } from '../constants/global'
import BookingEvent from './BookingEvent'
import ListingMini from './ListingMini'
import AccountDropdown from './AccountDropdown'
// import EthEvent from './EthEvent'

class AccountPage extends Component {
  constructor() {
    super()
    this.handleFetchEvents = this.handleFetchEvents.bind(this)
  }

  componentDidUpdate(prevProps) {
    const { accounts, selectedAccountIndex, dispatch } = this.props
    if (isSet(accounts) && prevProps.selectedAccountIndex !== selectedAccountIndex) {
      const myAddr = accounts[selectedAccountIndex]
      dispatch(fetchAccountInfo(myAddr))
    }
  }

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

  handleFetchEvents() {
    const { dispatch, accounts, contract, selectedAccountIndex } = this.props
    const accountAddr = accounts[selectedAccountIndex]
    dispatch(fetchEthEvents(contract, accountAddr))
  }

  render() {
    const { accountInfo, accounts, selectedAccountIndex, dispatch } = this.props
    console.log('AccountPage::render', selectedAccountIndex)
    const loadingDom = (
      <div>
        <Loader active />
        <AccountDropdown />
      </div>
    )
    // If accounts are not set, we return the spinner
    // and wait for a state update
    if (!isSet(accounts)) {
      return loadingDom
    }
    const myAddr = accounts[selectedAccountIndex]
    // At this point we know that accounts is set,
    // if accountInfo is still not set, dispatch
    // a request to get it
    if (!isSet(accountInfo)) {
      dispatch(fetchAccountInfo(myAddr))
      return loadingDom
    }

    // Event related stuff
    // const { events, contract } = this.props
    // const accountEvents = events.filter(event =>
    // Object.prototype.hasOwnProperty.call(event.returnValues, 'from')
    // && myAddr === event.returnValues.from)
    // const accountEventViews = accountEvents.map((event, idx) =>
    // <EthEvent key={idx} {...event} />)

    if (!Object.entries(accountInfo).length) {
      return (
        <div>
          <AccountDropdown />
          No such account
        </div>
      )
    }

    // My Bookings
    const bookingEvents = accountInfo.bookings.map((booking, idx) => <BookingEvent key={idx} userAddr={myAddr} {...booking} />)
    const bookingsDOM = (bookingEvents.length) ? (<div> <h3> Bookings </h3> {bookingEvents} </div>) : (<span />)

    const listings = accountInfo.listings.map((listing, idx) => <ListingMini key={idx} {...listing} />)
    const listingsDOM = (listings.length) ? (<div> <h3> My Listings </h3> {listings} </div>) : (<span />)

    return (
      <div className="accounts-page">

        <div className="account-info">
          <div>
            <h5 style={{ display: 'inline', marginRight: '50px' }}>
              {accountInfo.name}
            </h5>
            <AccountDropdown />
          </div>
          <p> Date Created {formatDate(accountInfo.dateCreated)} </p>
          <p> Ethereum Address: {accountInfo.addr} </p>
          <p> { this.getMyRating() } </p>
        </div>
        <div key="account-bookings" className="account-bookings">
          {bookingsDOM}
        </div>
        <div key="account-listings" className="account-listings">
          {listingsDOM}
        </div>
      </div>
    )
  }
}

AccountPage.defaultProps = {
  accounts: null,
  accountInfo: null,
  contract: null,
  events: [],
}

AccountPage.propTypes = {
  accounts: PropTypes.array,
  accountInfo: PropTypes.object,
  contract: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  events: PropTypes.array,
  selectedAccountIndex: PropTypes.number.isRequired,
}

const mapStateToProps = state => ({
  accounts: state.accounts,
  accountInfo: state.accountInfo,
  contract: state.contract,
  events: state.ethEvents,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(AccountPage)
