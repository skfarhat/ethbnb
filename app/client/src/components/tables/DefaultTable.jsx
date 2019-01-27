import React, { Component } from 'react'
import ReactTable from 'react-table'

class DefaultTable extends Component {
  render() {
    const title = (this.props.title) ? (
      <h5>
        {' '}
        {this.props.title}
        {' '}
      </h5>
    ) : ''
    return (
      <div>
        {title}
        <ReactTable
          defaultPageSize={4}
          showPaginationBottom={false}
          NoDataComponent={() => null} // Don't display a message box if no data
          data={this.props.data}
          columns={this.props.columns}
        />
      </div>
    )
  }
}

export default DefaultTable
