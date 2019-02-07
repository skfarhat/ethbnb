import React, { Component } from 'react'
import DictTable from '../tables/DictTable'

class EthAccount extends Component {
  render() {
    return (
      <DictTable data={this.props.data} title="Ethereum Account" />
    )
  }
}

export default EthAccount
