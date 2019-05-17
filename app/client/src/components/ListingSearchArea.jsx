import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Dropdown } from 'semantic-ui-react'
import EthDatePicker from './EthDatePicker'
import { countryOptions } from './common'
import { isSet } from '../constants/global'
import { SET_SEARCH_OPTIONS } from '../redux/actions'
import { fetchListings } from '../redux/listingActions'
import '../css/listing-search.css'


class ListingSearchArea extends Component {
  constructor() {
    super()
    this.searchButtonClicked = this.searchButtonClicked.bind(this)
    this.onCountryChange = this.onCountryChange.bind(this)
    this.onDateChange = this.onDateChange.bind(this)
    this.countryCodes = countryOptions.map(countryO => ({
      ...countryO,
      value: countryO.code,
    }))
  }

  // This callback is called once for every date in the range
  // (twice). We only want to make an update to SearchOptions
  // when:
  // - both dates are set (data !== null && data.length === 2)
  // - no dates are set at all (when the user clears their selection)
  onDateChange(data) {
    const { dispatch } = this.props
    if (data === null) {
      dispatch({
        type: SET_SEARCH_OPTIONS,
        data: {
          fromDate: null,
          toDate: null,
        },
      })
    } else if (data.length === 2) {
      dispatch({
        type: SET_SEARCH_OPTIONS,
        data: {
          fromDate: data[0],
          toDate: data[1],
        },
      })
    }
  }

  onCountryChange(ev, data) {
    const { dispatch } = this.props
    const { value } = data
    // User has most probably deselected
    // something, we want to set value to its default -1
    const countryCode = isSet(value) && value === '' ? -1 : value
    dispatch({
      type: SET_SEARCH_OPTIONS,
      data: {
        countryCode,
      },
    })
  }

  searchButtonClicked() {
    const { dispatch } = this.props
    const { fromDate, toDate, countryCode } = this.props
    const opts = {
      fromDate,
      toDate,
      countryCode,
    }
    dispatch(fetchListings(opts))
  }

  render() {
    const { countryCode, fromDate, toDate } = this.props
    return (
      <div className="listing-search-area">
        <EthDatePicker
          onDateChange={this.onDateChange}
          selected={(!fromDate || !toDate) ? [] : [fromDate, toDate]}
        />
        <div className="countrypicker-wrapper">
          <Dropdown
            className="dropdown-wrapper"
            placeholder="Select Country"
            fluid
            search
            selection
            clearable
            value={countryCode}
            options={this.countryCodes}
            onChange={this.onCountryChange}
          />
        </div>
        <div className="searchButton-wrapper">
          <Button
            className="ListingSearchButton"
            onClick={this.searchButtonClicked}
          >
          Search
          </Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  countryCode: state.searchOptions.countryCode,
  fromDate: state.searchOptions.fromDate,
  toDate: state.searchOptions.toDate,
})

ListingSearchArea.defaultProps = {
  countryCode: null,
  fromDate: null,
  toDate: null,
}

ListingSearchArea.propTypes = {
  dispatch: PropTypes.func.isRequired,
  countryCode: PropTypes.number,
  fromDate: PropTypes.instanceOf(Date),
  toDate: PropTypes.instanceOf(Date),
}


export default connect(mapStateToProps)(ListingSearchArea)
