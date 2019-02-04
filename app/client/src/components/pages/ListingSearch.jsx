import React, { Component } from 'react'
import { connect } from 'react-redux'
import Listing from './Listing'
import Img from 'react-image'
import { Link } from 'react-router-dom'
import RGL, { WidthProvider } from "react-grid-layout";
import log from '../../logger'
import '../../../node_modules/react-grid-layout/css/styles.css'
import '../../../node_modules/react-resizable/css/styles.css'


const ReactGridLayout = WidthProvider(RGL);
const mapStateToProps = state => ({ listings: state.server.listings })

class ListingSearch extends Component {
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
          <Link to={"/listing/" + key}> <h5> {l.title} </h5>  </Link> 
          <div> <em> Location: </em> <span className="location"> {l.location} </span> </div>
          <div> <em> Country: </em> <span className="country"> {l.country} </span> </div>
          <div> <em> Price: </em> <span className="price"> {l.price} </span> </div> 
          {/* <IPFSImage hash={l.mainImageHash} ext={l.mainImageExtension} /> */}
        </div>
      ))
      // console.log('pushing ', i)
      const x = i % COLS
      const y = parseInt(i / COLS)
      layout.push({
        i: i.toString(),
        x: i % COLS,
        y: i / COLS,
        w: 1,
        h: 1,
      })
      i += 1
    })

    return (
        <ReactGridLayout items={3} layout={layout} cols={3} rowHeight={30} width={300}>
          {doms}
        </ReactGridLayout>
    )
  }
}

export default connect(mapStateToProps, null)(ListingSearch)
