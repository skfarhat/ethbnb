import log from '../../logger'
import React, { Component } from 'react'
import DictTable from '../tables/DictTable'

class EthAccount extends Component {
  render() {
    log.debug("EthAccount:: render()", this.props)
    return (
      <DictTable data={this.props.data} title="Ethereum Account" />
    )
  }
}

export default EthAccount
