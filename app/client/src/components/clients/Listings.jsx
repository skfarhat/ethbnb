import log from '../../logger'
import React, { Component } from 'react'
import DefaultTable from './Tables'

class Listings extends Component {
  render() {
    log.debug("Listings::render()", this.props.listings)
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
    return (
      <div> 
      Sup sup 
      </div> 
      )
    // return (
    //   <DefaultTable
    //   data={data}
    //   columns={columns}
    //   defaultPageSize={4}
    //   showPaginationBottom={false}
    //   noDataText="No listings"
    //   />
    // )
  }
}
export default Listings
