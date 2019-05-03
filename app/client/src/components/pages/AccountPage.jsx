import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Loader } from 'semantic-ui-react'
import { fetchEthEvents, fetchEthEventsIfNeeded, fetchAccountInfo } from '../../redux/actions'
import EthEvent from './EthEvent'
import BookingEvent from './BookingEvent'
import ListingMini from './ListingMini'

class AccountPage extends Component {
  constructor() {
    super()
    this.handleFetchEvents = this.handleFetchEvents.bind(this)
    this.getSelectedAddr = this.getSelectedAddr.bind(this)
  }

  componentDidMount() {
    this.fetchAccountInfo()
  }

  componentDidUpdate(prevProps) {
    const { accountInfo, selectedAccountIndex } = this.props
    if (!accountInfo || prevProps.selectedAccountIndex !== selectedAccountIndex) {
      this.fetchAccountInfo()
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

  getSelectedAddr() {
    const { accounts, selectedAccountIndex } = this.props
    return accounts[selectedAccountIndex]
  }

  fetchAccountInfo() {
    const { dispatch } = this.props
    dispatch(fetchAccountInfo(this.getSelectedAddr()))
  }

  handleFetchEvents() {
    const { dispatch, accounts, contract, selectedAccountIndex } = this.props
    const accountAddr = accounts[selectedAccountIndex]
    dispatch(fetchEthEvents(contract, accountAddr))
  }

  render() {
    // TODO: show error message if there is no account and the page is accessed
    //       e.g. if the user types in /account in the URL but there are no eth accounts.
    const { accountInfo } = this.props
    const myAddr = this.getSelectedAddr()

    // const { events, contract } = this.props
    // const accountEvents = events.filter(event =>
    // Object.prototype.hasOwnProperty.call(event.returnValues, 'from')
    // && myAddr === event.returnValues.from)
    // const accountEventViews = accountEvents.map((event, idx) =>
    // <EthEvent key={idx} {...event} />)

    if (!accountInfo) {
      return (<Loader active />)
    }
    if (!Object.entries(accountInfo).length) {
      return (<div> <p> No account found </p> </div>)
    }

    // My Bookings
    const bookingEvents = accountInfo.bookings.map((booking, idx) => <BookingEvent key={idx} userAddr={myAddr} {...booking} />)
    const bookingsDOM = (bookingEvents.length) ? (<div> <h3> Bookings </h3> {bookingEvents} </div>) : (<span />)

    const listings = accountInfo.listings.map((listing, idx) => <ListingMini key={idx} {...listing} />)
    const listingsDOM = (listings.length) ? (<div> <h3> My Listings </h3> {listings} </div>) : (<span />)

    return (
      <div className="accounts-page">
        <div className="account-info">
          <h5> {accountInfo.name} </h5>
          <p> Date Created {accountInfo.dateCreated} </p>
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
  accounts: [],
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
  accounts: Object.keys(state.accounts),
  accountInfo: state.accountInfo,
  contract: state.contract,
  events: state.ethEvents,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(AccountPage)
