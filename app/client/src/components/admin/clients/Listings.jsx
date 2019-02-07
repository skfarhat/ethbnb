import React, { Component } from 'react'
import DefaultTable from '../tables/DefaultTable'

class Listings extends Component {
  render() {
    const columns = [{
      Header: 'ID',
      accessor: 'id',
    }, {
      Header: 'Name',
      accessor: 'shortName',
    }, {
      Header: 'Price',
      accessor: 'price',
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
