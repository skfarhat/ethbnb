import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button } from 'semantic-ui-react'
import { fetchEthEvents, fetchEthEventsIfNeeded } from '../../redux/actions'
import EthEvent from './EthEvent'
import BookingEvent from './BookingEvent'

class AccountPage extends Component {
  constructor() {
    super()
    this.handleFetchEvents = this.handleFetchEvents.bind(this)
    this.getSelectedAddr = this.getSelectedAddr.bind(this)
  }

  componentDidMount() {
    const { dispatch, selectedAccountIndex, accounts } = this.props
    if (Array.isArray(accounts) && accounts.length > 0) {
      const accountAddr = accounts[selectedAccountIndex]
      dispatch(fetchEthEventsIfNeeded(accountAddr))
    }
  }

  getSelectedAddr() {
    const { accounts, selectedAccountIndex } = this.props
    return accounts[selectedAccountIndex]
  }

  handleFetchEvents() {
    const { dispatch, accounts, contract, selectedAccountIndex } = this.props
    const accountAddr = accounts[selectedAccountIndex]
    dispatch(fetchEthEvents(contract, accountAddr))
  }

  render() {
    // TODO: show error message if there is no account and the page is accessed
    //       e.g. if the user types in /account in the URL but there are no eth accounts.
    const { events, contract } = this.props
    const myAddr = this.getSelectedAddr()
    const accountEvents = events.filter(event => Object.prototype.hasOwnProperty.call(event.returnValues, 'from')
      && myAddr === event.returnValues.from)
    const accountEventViews = accountEvents.map((event, idx) => <EthEvent key={idx} {...event} />)
    const bookingEvents = accountEvents.filter(event => event.event === 'BookingComplete')
      .map((event, idx) => <BookingEvent key={idx} ethAddr={myAddr} contract={contract} {...event} />)
    return (
      <div className="accounts-page">
        {`Welcome to the accounts page: ${myAddr}`}
        <div key="accounts-bookings" className="accounts-bookings">
          <h3> My Bookings </h3>
          { bookingEvents }
        </div>
        <div key="account-events" className="account-events">
          <h3> Ethereum Events </h3>
          <Button onClick={this.handleFetchEvents}>
            Fetch events
          </Button>
          { accountEventViews }
        </div>
      </div>
    )
  }
}

AccountPage.defaultProps = {
  accounts: [],
  contract: null,
  events: [],
}

AccountPage.propTypes = {
  accounts: PropTypes.array,
  contract: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
  events: PropTypes.array,
  selectedAccountIndex: PropTypes.number.isRequired,
}

const mapStateToProps = state => ({
  accounts: Object.keys(state.accounts),
  contract: state.contract,
  events: state.ethEvents,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(AccountPage)
