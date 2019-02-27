import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { Button, Dropdown } from 'semantic-ui-react'
import { countryOptions } from './common'
import EthDatePicker from './EthDatePicker'
import { fetchListings, setSearchOptions } from '../../redux/actions'
import '../../css/listing-search.css'

class ListingSearchArea extends Component {
  constructor() {
    super()
    this.searchButtonClicked = this.searchButtonClicked.bind(this)
    this.onCountryChange = this.onCountryChange.bind(this)
    this.countryCodes = countryOptions.map(countryO => ({
      ...countryO,
      value: countryO.code,
    }))
  }

  onCountryChange(ev, data) {
    const { dispatch } = this.props
    dispatch(setSearchOptions({
      countryCode: data.value,
    }))
  }

  searchButtonClicked() {
    const { dispatch } = this.props
    dispatch(fetchListings())
  }

  render() {
    const { countryCode } = this.props
    return (
      <div className="listing-search-area">
        <EthDatePicker />
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
  countryCode: state.searchOptions.countryCode,
})

ListingSearchArea.defaultProps = {
  countryCode: null,
}

ListingSearchArea.propTypes = {
  dispatch: PropTypes.func.isRequired,
  countryCode: PropTypes.number,
}


export default connect(mapStateToProps)(ListingSearchArea)
