import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
// import GridLayout from 'react-grid-layout'
import RGL, { WidthProvider } from "react-grid-layout";

import log from '../../logger'
import ListingMini from './ListingMini'
import '../../../node_modules/react-grid-layout/css/styles.css'
import '../../../node_modules/react-resizable/css/styles.css'


const ReactGridLayout = WidthProvider(RGL);
const mapStateToProps = state => ({ listings: state.server.listings })

class ListingsPage extends Component {
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
        <div key={i}>
          <ListingMini
            key={i}
            title={l.title}
            price={l.price}
            location={l.location}
            country={l.country}
          />
        </div>
      ))
      // console.log('pushing ', i)
      const x = i % COLS
      const y = parseInt(i / COLS)
      console.log('pushing ', x, y)
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

export default withRouter(connect(mapStateToProps, null)(ListingsPage))
