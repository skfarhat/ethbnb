import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Loader } from 'semantic-ui-react'
import { fetchEthEvents, fetchEthEventsIfNeeded, fetchAccountInfo } from '../../redux/actions'
import EthEvent from './EthEvent'
import BookingEvent from './BookingEvent'


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
    if (accountInfo === null || prevProps.selectedAccountIndex !== selectedAccountIndex) {
      this.fetchAccountInfo()
    }
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
    const { events, contract, accountInfo } = this.props
    const myAddr = this.getSelectedAddr()
    const accountEvents = events.filter(event => Object.prototype.hasOwnProperty.call(event.returnValues, 'from')
      && myAddr === event.returnValues.from)
    // const accountEventViews = accountEvents.map((event, idx) => <EthEvent key={idx} {...event} />)

    if (!accountInfo) {
      return (<Loader active />)
    }

    // My Bookings
    const bookingEvents = accountInfo.bookings.map((booking, idx) => <BookingEvent key={idx} userAddr={myAddr} {...booking} />)
    const bookingsDOM = (bookingEvents.length) ? (<div> <h3> Bookings </h3> {bookingEvents} </div>) : (<span />)
    return (
      <div className="accounts-page">
        <div className="account-info">
          <h5> {accountInfo.name} </h5>
          <p> Date Created {accountInfo.dateCreated} </p>
          <p> Ethereum Address: {accountInfo.addr} </p>
        </div>
        <div key="accounts-bookings" className="accounts-bookings">
          {bookingsDOM}
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
