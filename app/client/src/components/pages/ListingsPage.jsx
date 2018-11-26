import React, { Component } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import GridLayout from 'react-grid-layout'
import '../../../node_modules/react-grid-layout/css/styles.css'
import '../../../node_modules/react-resizable/css/styles.css'


const mapStateToProps = state => ({
  listings: state.server.listings,
})

class ListingsPage extends Component {
  render() {
    console.log('ListingsPage', this)
    // layout is an array of objects, see the demo for more complete usage
    const self = this
    let i = 0
    const layout = []
    const COLS = 3
    const doms = []
    Object.keys(self.props.listings).forEach((key) => {
      const l = self.props.listings[key]
      console.log(l)
      doms.push((<div key={i}>{l.shortName}</div>))
      layout.push({
        i: i.toString(),
        x: i % COLS,
        y: i / COLS,
        w: 3,
        h: 3,
      })
      i += 1
    })
    console.log('doms', doms)
    console.log('ListingsPage layout-doms', this, layout, doms)
    return (
      <GridLayout className="layout" layout={layout} cols={COLS} rowHeight={30} width={1200}>
        {doms}
      </GridLayout>
    )
  }
}

export default withRouter(connect(mapStateToProps, null)(ListingsPage))
