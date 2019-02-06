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
import IPFSImage from '../IPFSImage'


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

  render() {
    // layout is an array of objects, see the demo for more complete usage
    const self = this
    let i = 0
    const layout = []
    const COLS = 3
    const doms = []

    Object.keys(self.props.listings).forEach((key) => {
      const l = self.props.listings[key]

      // Prep stuff for the image
      const { images } = l
      let hash = ''
      let ext = ''
      if (Array.isArray(images) && images.length > 0) {
        const img = images[0]
        if (img.hasOwnProperty('hash') && img.hasOwnProperty('path')) {
          hash = img.hash
          ext = img.path.split('.').pop()
        }
      }

      doms.push((
        <div key={i} className="listing-mini">
          <Link to={'/listing/' + key}>
            <h5> {l.title} </h5>
          </Link>
          <div> <em> Location: </em> <span className="location"> {l.location} </span> </div>
          <div> <em> Country: </em> <span className="country"> {l.country} </span> </div>
          <div> <em> Price: </em> <span className="price"> {l.price} </span> </div>
          <IPFSImage hash={hash} ext={ext} />
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
