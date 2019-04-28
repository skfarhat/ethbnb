import React, { Component } from 'react'
import { connect } from 'react-redux'
import Rating from 'react-rating'
import PropTypes from 'prop-types'
import { rateBooking } from '../../redux/actions'

class BookingEvent extends Component {
  constructor(props) {
    super(props)
    this.onRatingChange = this.onRatingChange.bind(this)
  }

  onRatingChange(rating) {
    const { returnValues, dispatch, contract, ethAddr } = this.props
    const { lid, bid } = returnValues
    dispatch(rateBooking(lid, bid, rating, contract, ethAddr))
    // TODO: set it to readonly after setting or if it was already set (need to do that)
  }

  render() {
    const { event: name, transactionHash, returnValues } = this.props
    const rValuesDOM = {
      transactionHash,
    }
    Object.entries(returnValues).forEach((entry) => {
      // Only keep non-numeric keys
      if (Number.isNaN(parseInt(entry[0], 10))) {
        rValuesDOM[entry[0]] = entry[1]
      }
    })
    return (
      <div className="eth-event">
        <h5>
          Booking
        </h5>
        <table>
          <tbody>
            {
              Object.entries(rValuesDOM).map(e => (
                <tr key={e[0]}>
                  <td> { e[0] } </td>
                  <td> { e[1] } </td>
                </tr>
              ))
            }
          </tbody>
        </table>
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
  myAddr: PropTypes.string,
  contract: PropTypes.object,
  dispatch: PropTypes.func.isRequired,
}

const mapStateToProps = state => ({
  accounts: state.accounts,
  selectedAccountIndex: state.selectedAccountIndex,
})

export default connect(mapStateToProps)(BookingEvent)
