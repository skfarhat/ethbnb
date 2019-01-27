import React, { Component } from 'react'
import DefaultTable from './DefaultTable'

// A Table that takes in an object whose properites will be printed in a two column table.
// The first column contains the property name
// The second column contains the property value
class DictTable extends Component {
  render() {
    const data = []
    if (this.props.data) {
      for (const key in this.props.data) {
        data.push({
          key,
          value: this.props.data[key],
        })
      }
    }
    const columns = [{
      Header: 'Key',
      accessor: 'key',
    }, {
      Header: 'Value',
      accessor: 'value',
    }]
    return (
      <DefaultTable
        title={this.props.title}
        columns={columns}
        data={data}
      />
    )
  }
}

export default DictTable
