import React, { Component } from 'react'
import { connect } from 'react-redux'
import Img from 'react-image'
import { Link } from 'react-router-dom'
import RGL, { WidthProvider } from 'react-grid-layout'
import { Dropdown } from 'semantic-ui-react'
import log from '../../logger' // eslint-disable-line no-unused-vars
import '../../../node_modules/react-grid-layout/css/styles.css'
import '../../../node_modules/react-resizable/css/styles.css'
import { countryOptions } from './common'
import { SERVER_NODE_URL } from '../../constants/global'
import { setListingResults } from '../../actions'


const mapDispatchToProps = dispatch => ({
  dispatchMethods: {
    setListingResults: listings => dispatch(setListingResults(listings)),
  },
})

const ReactGridLayout = WidthProvider(RGL)
const mapStateToProps = state => ({ listings: state.listingResults })

class ListingSearch extends Component {
  constructor() {
    super()
    this.dropdownChanged = this.dropdownChanged.bind(this)
    this.countryCodes = countryOptions.map((countryO) => {
      return {
        ...countryO,
        value: countryO.code,
      }
    })
  }

  async dropdownChanged(event, data) {
    const self = this
    console.log('dropdownChanged')
    const { dispatchMethods } = this.props
    console.log('data', data)
    const { value: countryCode } = data
    console.log('dropdownChanged1')
    try {
      const hostname = `${SERVER_NODE_URL}api/listings/country/${countryCode}`
      console.log('hostname', hostname)
      fetch(hostname)
      .then(response => response.json())
      .then((listingsData) => {
        console.log(self.props)
        dispatchMethods.setListingResults(listingsData)
      })
      .catch(err => log.error(`failed to fetch by country ${SERVER_NODE_URL}`, err))
      // let response = await fetch(hostname)
      // console.log('response', response)
      // response = await response.json()
      // console.log('response.json()', response)
      // dispatchMethods.setListingSearchResults(response)
    } catch (err) {
      console.log(`Failed to connect to ${SERVER_NODE_URL}`, err)
    }
  }

  render() {
    // layout is an array of objects, see the demo for more complete usage
    const self = this
    let i = 0
    const layout = []
    const COLS = 3
    const doms = []
    Object.keys(self.props.listings).forEach((key) => {
      const l = self.props.listings[key]
      doms.push((
        <div key={i} className="listing-mini">
          <Img width="100px" src="http://localhost:3000/house-fallback.png" />
          <Link to={'/listing/' + key}>
          <h5> {l.title} </h5>
          </Link>
          <div> <em> Location: </em> <span className="location"> {l.location} </span> </div>
          <div> <em> Country: </em> <span className="country"> {l.country} </span> </div>
          <div> <em> Price: </em> <span className="price"> {l.price} </span> </div>
          {/* <IPFSImage hash={l.mainImageHash} ext={l.mainImageExtension} /> */}
        </div>
      ))
      const x = parseInt(i % COLS, 10)
      const y = parseInt(i / COLS, 10)
      console.log('adding ', x, y)
      layout.push({
        i: i.toString(),
        x: x,
        y: y,
        w: 1,
        h: 1,
      })
      i += 1
    })

    return (
      <div>
        <Dropdown placeholder="Select Country" fluid search selection options={self.countryCodes} onChange={self.dropdownChanged} />
        <ReactGridLayout items={3} layout={layout} cols={3} rowHeight={300} width={300} isDraggable={false} isResizable={false}>
          {doms}
        </ReactGridLayout>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ListingSearch)
