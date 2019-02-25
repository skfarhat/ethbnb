import React, { Component } from 'react'
import { Button, Dropdown } from 'semantic-ui-react'
import SemanticDatepicker from 'react-semantic-ui-datepickers'
import ptLocale from 'react-semantic-ui-datepickers/dist/locales/pt-BR'
import { countryOptions } from './common'
import { SERVER_NODE_URL } from '../../constants/global'
import 'react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css'
import '../../css/listing-search.css'

class ListingSearchArea extends Component {
  constructor() {
    super()
    this.searchButtonClicked = this.searchButtonClicked.bind(this)
    this.dropdownChanged = this.dropdownChanged.bind(this)
    this.countryCodes = countryOptions.map(countryO => ({
      ...countryO,
      value: countryO.code,
    }))
  }

  async dropdownChanged(event, data) {
    // FIX: This
    const { dispatchMethods } = this.props
    const { value: countryCode } = data
    try {
      const hostname = `${SERVER_NODE_URL}api/listings/country/${countryCode}`
      let response = await fetch(hostname)
      response = await response.json()
      dispatchMethods.setListingResults(response)
    } catch (err) {
      console.log(`Failed to connect to ${SERVER_NODE_URL}`, err)
    }
  }

  onDateChange() {
    console.log('onDateChange')
  }

  searchButtonClicked() {
    console.log('searchButtonClicked')
    const { dispatch, countryCode, startDate, endDate } = this.props
    dispatch()
  }

  render() {
    return (
      <div className="listing-search-area">
        <div className="datepicker-wrapper">
          <SemanticDatepicker
            locale={ptLocale}
            onDateChange={this.onDateChange}
            type="range"
          />
        </div>
        <div className="countrypicker-wrapper">
          <Dropdown
            className="dropdown-wrapper"
            placeholder="Select Country"
            fluid
            search
            selection
            options={this.countryCodes}
            onChange={ (ev, data) => this.setState({ countryCode: data.value }) }
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

export default ListingSearchArea
