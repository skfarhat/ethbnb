import log from '../../logger'
import React, { Component } from 'react'
import DefaultTable from '../tables/DefaultTable'

class Listings extends Component {
  render() {
    log.debug("Listings::render()", this.props.data)
    const columns = [{
      Header: 'ID',
      accessor: 'id'
    }, {
      Header: 'Name',
      accessor: 'shortName'
    }, {
      Header: 'Price',
      accessor: 'price'
    }]
    return (
      <DefaultTable
      title="Listings"
      data={this.props.data}
      columns={columns}
      />
    )
  }
}
export default Listings
