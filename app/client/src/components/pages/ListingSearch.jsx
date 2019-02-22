import React, { Component } from 'react'
import { connect } from 'react-redux'
import RGL, { WidthProvider } from 'react-grid-layout'
import { Button, Dropdown, Loader } from 'semantic-ui-react'
import { DateRangePicker } from 'react-dates'
import '../../../node_modules/react-grid-layout/css/styles.css'
import '../../../node_modules/react-resizable/css/styles.css'
import { countryOptions } from './common'
import { SERVER_NODE_URL } from '../../constants/global'
import ListingMini from './ListingMini'
import { fetchListingsIfNeeded } from '../../actions'

const ReactGridLayout = WidthProvider(RGL)
const mapStateToProps = state => ({
  listings: state.listings || [],
  isFetching: state.isFetching,
})

class ListingSearch extends Component {
  constructor() {
    super()
    this.searchButtonClicked = this.searchButtonClicked.bind(this)
    this.dropdownChanged = this.dropdownChanged.bind(this)
    this.countryCodes = countryOptions.map(countryO => ({
      ...countryO,
      value: countryO.code,
    }))
    this.state = {
      startDate: null,
      endDate: null,
      focusedInput: null,
    }
  }

  async componentDidMount() {
    const { dispatch } = this.props
    dispatch(fetchListingsIfNeeded())
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
    const { dispatch } = this.props
    dispatch()
  }

  render() {
    const self = this
    // ReactGridLayout
    const COLS = 3
    const layout = []
    const doms = []
    let i = 0

    const { isFetching } = this.props

    console.log('self.props.listings', self.props.listings)
    Object.keys(self.props.listings).forEach((key) => {
      const l = self.props.listings[key]

      // Prep stuff for the image
      const { images } = l
      let hash = ''
      let ext = ''
      if (Array.isArray(images) && images.length > 0) {
        const img = images[0]
        if (img && Object.prototype.hasOwnProperty.call(img, 'hash')
          && Object.prototype.hasOwnProperty.call(img, 'path')) {
          hash = img.hash
          ext = img.path.split('.').pop()
        }
      }

      doms.push((
        <div className="listing-mini" key={i}>
          <ListingMini
            hash={hash}
            ext={ext}
            {...l}
          />
        </div>
      ))
      layout.push({
        i: i.toString(),
        x: parseInt(i % COLS, 10),
        y: parseInt(i / COLS, 10),
        w: 1,
        h: 1,
      })
      i += 1
    })
    return (
      <div className="listing-router-container">
        <Loader
          active={isFetching}
        />
        <Dropdown
          placeholder="Select Country"
          fluid
          search
          selection
          options={self.countryCodes}
          onChange={self.dropdownChanged}
        />
        <DateRangePicker
          startDateId="startDate"
          endDateId="endDate"
          startDate={this.state.startDate}
          endDate={this.state.endDate}
          onDatesChange={({ startDate, endDate }) => { this.setState({ startDate, endDate })}}
          focusedInput={this.state.focusedInput}
          onFocusChange={(focusedInput) => { this.setState({ focusedInput })}}
        />
        <Button
          onClick={this.searchButtonClicked}
        >
        Search
        </Button>
        <ReactGridLayout
          items={3}
          layout={layout}
          cols={3}
          rowHeight={300}
          width={300}
          isDraggable={false}
          isResizable={false}
        >
          {doms}
        </ReactGridLayout>
      </div>
    )
  }
}

export default connect(mapStateToProps)(ListingSearch)
