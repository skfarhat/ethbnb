import React, { Component } from 'react'
import { Button, Dropdown } from 'semantic-ui-react'
import { DateRangePicker } from 'react-dates'
import { countryOptions } from './common'
import { SERVER_NODE_URL } from '../../constants/global'


class ListingSearchArea extends Component {
  constructor() {
    super()
    this.searchButtonClicked = this.searchButtonClicked.bind(this)
    this.dropdownChanged = this.dropdownChanged.bind(this)
    this.countryCodes = countryOptions.map(countryO => ({
      ...countryO,
      value: countryO.code,
    }))
    this.state = {
      countryCode: null,
      focusedInput: null,
      startDate: null,
      endDate: null,
    }
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

  searchButtonClicked() {
    console.log('searchButtonClicked')
    const { dispatch, countryCode, startDate, endDate } = this.props
    dispatch()
  }

  render() {
    const { startDate, endDate, focusedInput } = this.state
    return (
      <div className="listing-search-area">
        <Dropdown
          placeholder="Select Country"
          fluid
          search
          selection
          options={this.countryCodes}
          onChange={ (ev, data) => this.setState({ countryCode: data.value }) }
        />
        <DateRangePicker
          startDateId="startDate"
          endDateId="endDate"
          startDate={startDate}
          endDate={endDate}
          onDatesChange={({ start, end }) => { this.setState({ startDate: start, endDate: end }) }}
          focusedInput={focusedInput}
          onFocusChange={(focused) => { this.setState({ focusedInput: focused }) }}
        />
        <Button
          onClick={this.searchButtonClicked}
        >
        Search
        </Button>
      </div>
    )
  }
}

export default ListingSearchArea
