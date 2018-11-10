import log from '../logger'
import React, { Component } from 'react'
import ReactTable from 'react-table'

class Listings extends Component {
  render() {
    log.debug("Listings::render()", this.props.listings)
    console.log(this.props.listings, this.props.listings.length)
    const listings = this.props.listings
    console.log(listings)
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
    const data = (!this.props.listings || !this.props.listings.length) ? [] : this.props.listings
    console.log(data)
    return (
      <ReactTable
      data={data}
      columns={columns}
      defaultPageSize={4}
      showPaginationBottom={false}
      noDataText="No listings"
      />
    )
  }
}
export default Listings
