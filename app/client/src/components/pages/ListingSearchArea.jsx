import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Dropdown } from 'semantic-ui-react'
import SemanticDatepicker from 'react-semantic-ui-datepickers'
import { countryOptions } from './common'
import { fetchListings, setSearchOptions } from '../../redux/actions'
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css'
import '../../css/listing-search.css'


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

  onDateChange(data) {
    const { dispatch, countryCode } = this.props
    if (data.length === 2) {
      dispatch(setSearchOptions({
        countryCode,
        fromDate: data[0],
        toDate: data[1],
      }))
    }
  }

  onCountryChange(ev, data) {
    const { dispatch, fromDate, toDate } = this.props
    dispatch(setSearchOptions({
      fromDate,
      toDate,
      countryCode: data.value,
    }))
  }

  searchButtonClicked() {
    const { dispatch } = this.props
    dispatch(fetchListings())
  }

  render() {
    const { countryCode, fromDate, toDate } = this.props
    return (
      <div className="listing-search-area">
        <div className="datepicker-wrapper">
          <SemanticDatepicker
            onDateChange={this.onDateChange}
            type="range"
            selected={(!fromDate || !toDate) ? [] : [fromDate, toDate]}
          />
        </div>
        <div className="countrypicker-wrapper">
          <Dropdown
            className="dropdown-wrapper"
            placeholder="Select Country"
            fluid
            search
            selection
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
  fromDate: state.searchOptions.fromDate,
  toDate: state.searchOptions.toDate,
  countryCode: state.searchOptions.countryCode,
})

ListingSearchArea.defaultProps = {
  fromDate: null,
  toDate: null,
  countryCode: null,
}

ListingSearchArea.propTypes = {
  dispatch: PropTypes.func.isRequired,
  fromDate: PropTypes.instanceOf(Date),
  toDate: PropTypes.instanceOf(Date),
  countryCode: PropTypes.number,
}


export default connect(mapStateToProps)(ListingSearchArea)
